#!/usr/bin/env python3
"""Rize Unreal MCP köprüsü — Claude Code ↔ Unreal Engine 5 editörü.

Bağımlılıksız (yalnızca Python 3.10+ standart kütüphanesi) bir MCP sunucusu.
stdio üzerinden JSON-RPC 2.0 konuşur; editöre Unreal'ın Remote Control HTTP
API'si (varsayılan http://127.0.0.1:30010) ile bağlanır ve editör içinde Python
çalıştırır (PythonScriptLibrary.ExecutePythonCommandEx).

Editörde gerekenler (RizeSim.uproject'te zaten açık):
  * Remote Control API eklentisi  — web sunucusu 30010 portunda (yalnızca localhost)
  * Python Editor Script Plugin

Claude Code kaydı (depo kökündeki .mcp.json bunu yapar):
  claude mcp add rize-unreal -- python3 RizeSim/Tools/mcp/rize_unreal_mcp.py

Ortam değişkenleri:
  RIZE_UE_URL      Remote Control adresi (varsayılan http://127.0.0.1:30010)
  RIZE_UE_TIMEOUT  saniye (varsayılan 60)
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import textwrap
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable

SERVER_NAME = "rize-unreal"
SERVER_VERSION = "0.1.0"
SUPPORTED_PROTOCOLS = ("2025-06-18", "2025-03-26", "2024-11-05")
PROJECT_ROOT = Path(__file__).resolve().parents[2]  # RizeSim/

UE_URL = os.environ.get("RIZE_UE_URL", "http://127.0.0.1:30010").rstrip("/")
UE_TIMEOUT = float(os.environ.get("RIZE_UE_TIMEOUT", "60"))
PY_LIBRARY = "/Script/PythonScriptPlugin.Default__PythonScriptLibrary"
# Remote Control yerel çalışır: sistem vekil sunucusu (HTTP_PROXY) atlanır
_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


class ToolError(Exception):
    """Araç düzeyinde hata: isError=true ile kullanıcıya metin olarak döner."""


# ---- Unreal Remote Control istemcisi ------------------------------------------

def ue_request(method: str, path: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(UE_URL + path, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with _OPENER.open(req, timeout=UE_TIMEOUT) as resp:
            raw = resp.read().decode("utf-8") or "{}"
            return json.loads(raw)
    except urllib.error.URLError as exc:
        raise ToolError(
            f"Unreal editörüne ulaşılamadı ({UE_URL}): {exc}. Editör açık mı, Remote Control web sunucusu "
            f"çalışıyor mu? Editör konsolunda: WebControl.StartServer") from exc


def ue_python(code: str) -> dict:
    """Editörde Python çalıştırır; dönüş: {ok, result, log}."""
    body = {
        "objectPath": PY_LIBRARY,
        "functionName": "ExecutePythonCommandEx",
        "parameters": {"PythonCommand": code, "ExecutionMode": "ExecuteFile", "FileExecutionScope": "Public"},
        "generateTransaction": True,
    }
    r = ue_request("PUT", "/remote/object/call", body)
    log = r.get("LogOutput") or []
    lines = [f"[{e.get('Type', '')}] {e.get('Output', '')}".rstrip() for e in log if isinstance(e, dict)]
    return {"ok": bool(r.get("ReturnValue", False)), "result": r.get("CommandResult", ""), "log": "\n".join(lines)}


def run_and_report(code: str) -> str:
    out = ue_python(code)
    text = out["log"] or out["result"] or "(çıktı yok)"
    if not out["ok"]:
        raise ToolError("Editörde Python hatası:\n" + text)
    return text


def py_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


# ---- Araçlar ------------------------------------------------------------------

TOOLS: dict[str, dict[str, Any]] = {}


def tool(name: str, description: str, schema: dict):
    def deco(fn: Callable[[dict], str]):
        TOOLS[name] = {"fn": fn, "spec": {"name": name, "description": description, "inputSchema": schema}}
        return fn
    return deco


def obj(props: dict, required: list[str] | None = None) -> dict:
    return {"type": "object", "properties": props, "required": required or [], "additionalProperties": False}


@tool("ue_ping", "Unreal editörünün Remote Control bağlantısını sınar; motor sürümünü ve açık haritayı döndürür.", obj({}))
def t_ping(_: dict) -> str:
    return run_and_report(textwrap.dedent("""
        import unreal
        w = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
        print("Motor:", unreal.SystemLibrary.get_engine_version())
        print("Harita:", w.get_name() if w else "-")
        print("Proje:", unreal.Paths.get_project_file_path())
    """))


@tool("ue_run_python", "Unreal editöründe rastgele Python kodu çalıştırır (unreal modülü erişilebilir). Çıktıyı (print) döndürür.",
      obj({"code": {"type": "string", "description": "Çalıştırılacak Python kodu"}}, ["code"]))
def t_run_python(a: dict) -> str:
    return run_and_report(a["code"])


@tool("ue_console", "Editör (ya da çalışan PIE) dünyasında konsol komutu çalıştırır, örn. 'stat fps' veya 'RizeSaat 18'.",
      obj({"command": {"type": "string"}, "pie": {"type": "boolean", "description": "true: çalışan oyunda (PIE) çalıştır"}}, ["command"]))
def t_console(a: dict) -> str:
    world_expr = "unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_game_world()" if a.get("pie") else \
                 "unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()"
    return run_and_report(f"import unreal\nw = {world_expr}\nassert w, 'Dünya yok (PIE çalışıyor mu?)'\n"
                          f"unreal.SystemLibrary.execute_console_command(w, {py_str(a['command'])})\nprint('çalıştırıldı:', {py_str(a['command'])})")


@tool("ue_list_actors", "Açık haritadaki aktörleri listeler (sınıf adı ve/veya etiket filtresiyle).",
      obj({"class_contains": {"type": "string"}, "label_contains": {"type": "string"}, "limit": {"type": "integer", "minimum": 1, "maximum": 2000}}))
def t_list_actors(a: dict) -> str:
    return run_and_report(textwrap.dedent(f"""
        import unreal
        cls_f, lbl_f, limit = {py_str(a.get('class_contains', ''))}.lower(), {py_str(a.get('label_contains', ''))}.lower(), {int(a.get('limit', 200))}
        actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
        hit = [x for x in actors if cls_f in x.get_class().get_name().lower() and lbl_f in x.get_actor_label().lower()]
        print(f"{{len(hit)}} aktör (toplam {{len(actors)}})")
        for x in hit[:limit]:
            l = x.get_actor_location()
            print(f"{{x.get_actor_label()}} | {{x.get_class().get_name()}} | ({{l.x:.0f}}, {{l.y:.0f}}, {{l.z:.0f}}) | {{x.get_folder_path()}}")
    """))


@tool("ue_spawn_actor", "Haritaya bir aktör yerleştirir. class_path: '/Script/RizeSim.RizeDolmusStop' gibi C++ sınıfı ya da '/Game/...' Blueprint yolu.",
      obj({"class_path": {"type": "string"},
           "location": {"type": "array", "items": {"type": "number"}, "minItems": 3, "maxItems": 3, "description": "cm: X=doğu, Y=güney, Z=yukarı"},
           "yaw": {"type": "number"}, "label": {"type": "string"}, "folder": {"type": "string"}}, ["class_path", "location"]))
def t_spawn(a: dict) -> str:
    x, y, z = a["location"]
    return run_and_report(textwrap.dedent(f"""
        import unreal
        sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
        path = {py_str(a['class_path'])}
        loc, rot = unreal.Vector({x}, {y}, {z}), unreal.Rotator(0, 0, {float(a.get('yaw', 0.0))})
        if path.startswith('/Script/'):
            cls = unreal.load_class(None, path)
            actor = sub.spawn_actor_from_class(cls, loc, rot)
        else:
            actor = sub.spawn_actor_from_object(unreal.EditorAssetLibrary.load_asset(path), loc, rot)
        assert actor, 'yerleştirilemedi: ' + path
        if {py_str(a.get('label', ''))}: actor.set_actor_label({py_str(a.get('label', ''))})
        if {py_str(a.get('folder', ''))}: actor.set_folder_path({py_str(a.get('folder', ''))})
        print('yerleştirildi:', actor.get_actor_label(), actor.get_class().get_name())
    """))


@tool("rize_import_layout", "OSM yerleşimini (Content/Data/layout_<bölge>.json) sahneye kurar: yollar, binalar, lambalar, ızgaralar, direkler, kovalar, korkuluklar, duraklar.",
      obj({"region": {"type": "string", "enum": ["merkez", "ayder"]},
           "parts": {"type": "array", "items": {"type": "string", "enum": ["roads", "buildings", "lamps", "drains", "poles", "bins", "rails", "stops"]}}},
          ["region"]))
def t_import_layout(a: dict) -> str:
    parts = tuple(a.get("parts") or ("roads", "buildings", "lamps", "drains", "poles", "bins", "rails", "stops"))
    return run_and_report(f"import importlib, rize_import_layout as r\nimportlib.reload(r)\nprint(r.run({py_str(a['region'])}, {parts!r}))")


@tool("rize_preview_sky", "Editörde (oyun çalışmadan) gökyüzünü belirli bir saat ve güne göre önizler (ARizeSkyController).",
      obj({"hour": {"type": "number", "minimum": 0, "maximum": 24}, "day_of_year": {"type": "integer", "minimum": 1, "maximum": 365}}, ["hour"]))
def t_preview_sky(a: dict) -> str:
    return run_and_report(textwrap.dedent(f"""
        import unreal
        sky = [x for x in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors() if x.get_class().get_name() == 'RizeSkyController']
        assert sky, 'Haritada RizeSkyController yok'
        s = sky[0]
        s.modify()
        s.set_editor_property('preview_day_of_year', {int(a.get('day_of_year', 135))})
        s.set_editor_property('preview_hour', {float(a['hour'])})
        s.post_edit_change()
        print('önizleme saati', {float(a['hour'])}, 'gün', {int(a.get('day_of_year', 135))})
    """))


@tool("rize_set_time", "Çalışan oyunda (PIE) saati ayarlar ve isteğe bağlı zaman hızını değiştirir.",
      obj({"hour": {"type": "number", "minimum": 0, "maximum": 24}, "time_scale": {"type": "number", "minimum": 0}}, ["hour"]))
def t_set_time(a: dict) -> str:
    out = t_console({"command": f"RizeSaat {float(a['hour'])}", "pie": True})
    if "time_scale" in a:
        out += "\n" + t_console({"command": f"RizeHizi {float(a['time_scale'])}", "pie": True})
    return out


@tool("rize_set_weather", "Çalışan oyunda (PIE) havayı değiştirir (doğal geçişle).",
      obj({"weather": {"type": "string", "enum": ["Acik", "Bulutlu", "Cisenti", "Saganak", "Sis"]}}, ["weather"]))
def t_set_weather(a: dict) -> str:
    return t_console({"command": f"RizeHava {a['weather']}", "pie": True})


@tool("rize_validate_data", "Content/Data JSON dosyalarını (ürün, dükkan, hat, program, diyalog, araç) tutarlılık için denetler. Editör gerekmez.", obj({}))
def t_validate(_: dict) -> str:
    sys.path.insert(0, str(PROJECT_ROOT / "Tools"))
    import validate_data  # noqa: PLC0415
    errs = validate_data.validate()
    return "Veri dosyaları tutarlı." if not errs else "\n".join("HATA: " + e for e in errs)


@tool("rize_fetch_terrain", "Gerçek yükseklik verisinden Landscape yükseklik haritası üretir (Tools/geo/fetch_dem.py). Editör gerekmez.",
      obj({"region": {"type": "string", "enum": ["merkez", "ayder"]}, "zoom": {"type": "integer", "minimum": 10, "maximum": 15}}, ["region"]))
def t_fetch_terrain(a: dict) -> str:
    cmd = [sys.executable, str(PROJECT_ROOT / "Tools" / "geo" / "fetch_dem.py"), a["region"], "--zoom", str(a.get("zoom", 14)),
           "--out", str(PROJECT_ROOT / "Content" / "Terrain"), "--cache", str(PROJECT_ROOT / "Tools" / "cache" / "dem")]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if p.returncode != 0:
        raise ToolError(p.stderr or p.stdout)
    return p.stdout


# ---- JSON-RPC / MCP protokolü ---------------------------------------------------

def handle(msg: dict) -> dict | None:
    mid = msg.get("id")
    method = msg.get("method", "")
    params = msg.get("params") or {}

    def ok(result):
        return {"jsonrpc": "2.0", "id": mid, "result": result}

    def err(code, message):
        return {"jsonrpc": "2.0", "id": mid, "error": {"code": code, "message": message}}

    if mid is None:  # bildirim (notifications/initialized vb.): yanıt verilmez
        return None
    if method == "initialize":
        requested = params.get("protocolVersion", SUPPORTED_PROTOCOLS[0])
        version = requested if requested in SUPPORTED_PROTOCOLS else SUPPORTED_PROTOCOLS[0]
        return ok({"protocolVersion": version, "capabilities": {"tools": {"listChanged": False}},
                   "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
                   "instructions": "Rize simülasyonu için Unreal Engine 5 editör köprüsü. Dünya ekseni: +X doğu, +Y güney, +Z yukarı (cm)."})
    if method == "ping":
        return ok({})
    if method == "tools/list":
        return ok({"tools": [t["spec"] for t in TOOLS.values()]})
    if method == "tools/call":
        name = params.get("name")
        if name not in TOOLS:
            return err(-32602, f"Bilinmeyen araç: {name}")
        try:
            text = TOOLS[name]["fn"](params.get("arguments") or {})
            return ok({"content": [{"type": "text", "text": text}], "isError": False})
        except ToolError as exc:
            return ok({"content": [{"type": "text", "text": str(exc)}], "isError": True})
        except Exception as exc:  # noqa: BLE001 — sunucu çökmesin
            return ok({"content": [{"type": "text", "text": f"Beklenmeyen hata: {type(exc).__name__}: {exc}"}], "isError": True})
    return err(-32601, f"Desteklenmeyen yöntem: {method}")


def serve(stdin=sys.stdin, stdout=sys.stdout) -> None:
    for line in stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            resp = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "JSON ayrıştırma hatası"}}
        else:
            resp = handle(msg)
        if resp is not None:
            stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            stdout.flush()


if __name__ == "__main__":
    serve()
