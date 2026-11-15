"""Unreal editöründe çalışır: OSM yerleşimini (layout_<bölge>.json) sahneye kurar.

Editörde:  Araçlar → Python → Dosya Çalıştır, ya da Python konsolunda:
    import rize_import_layout as r; r.run("merkez")

ya da MCP köprüsü üzerinden ("rize_import_layout" aracı).

Ne kurar:
  * Sürülebilir her yol için ARizeRoadPath (spline, hız sınırı, zemin tipi)
  * Binalar: Geometry Script ile taban izinden gerçek ekstrüzyon (eklenti yoksa yönlü kutu)
  * Sokak lambaları, yağmur ızgaraları, elektrik direkleri, çöp kovaları, merdiven korkulukları:
    ASSETS tablosundaki Blueprint/mesh'lerden; varlık yoksa motorun temel şekilleriyle yer tutucu
  * Dolmuş durakları (OSM bus_stop) → ARizeDolmusStop

Landscape içe aktarımı elle yapılır (UE Python'da kararlı bir API yok):
  Landscape modu → Yeni → Dosyadan İçe Aktar → Content/Terrain/<bölge>_heightmap.png,
  ölçek ve konum <bölge>_landscape.json'dan. Bu betik değerleri günlüğe yazar.
"""
from __future__ import annotations

import json
import os

import unreal  # yalnızca editör içinde

import rize_layout_core as core

# Gerçek varlıklar hazır oldukça buraya yazılır. Boş/eksikse yer tutucu kullanılır.
ASSETS = {
    "street_lamp": "/Game/Rize/Altyapi/BP_SokakLambasi",
    "storm_drain": "/Game/Rize/Altyapi/SM_YagmurIzgarasi",
    "utility_pole": "/Game/Rize/Altyapi/SM_ElektrikDiregi",
    "trash_bin": "/Game/Rize/Altyapi/SM_CopKovasi",
    "handrail_post": "/Game/Rize/Altyapi/SM_KorkulukDikme",
    "bus_stop": "/Game/Rize/Ulasim/BP_DolmusDuragi",
    "building_material": "/Game/Rize/Malzeme/MI_Cephe_Siva",
}
PLACEHOLDER = {
    "street_lamp": ("/Engine/BasicShapes/Cylinder", (0.15, 0.15, 7.0)),
    "storm_drain": ("/Engine/BasicShapes/Cube", (0.6, 0.35, 0.03)),
    "utility_pole": ("/Engine/BasicShapes/Cylinder", (0.25, 0.25, 9.0)),
    "trash_bin": ("/Engine/BasicShapes/Cylinder", (0.45, 0.45, 0.9)),
    "handrail_post": ("/Engine/BasicShapes/Cylinder", (0.05, 0.05, 0.95)),
}

actor_sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)


def project_dir() -> str:
    return unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())


def load_layout(region: str) -> dict:
    path = os.path.join(project_dir(), "Content", "Data", f"layout_{region}.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def log_landscape_instructions(region: str) -> None:
    path = os.path.join(project_dir(), "Content", "Terrain", f"{region}_landscape.json")
    if not os.path.exists(path):
        unreal.log_warning(f"[Rize] {path} yok — önce Tools/geo/fetch_dem.py çalıştırın")
        return
    with open(path, encoding="utf-8") as f:
        p = json.load(f)
    unreal.log(f"[Rize] Landscape: {p['resolution_px']} px, ölçek {p['landscape_scale']}, konum {p['landscape_location_cm']}")


def _spawn_static(kind: str, loc, yaw: float = 0.0, folder: str = ""):
    path = ASSETS.get(kind, "")
    asset = unreal.EditorAssetLibrary.load_asset(path) if path and unreal.EditorAssetLibrary.does_asset_exist(path) else None
    rot = unreal.Rotator(0.0, 0.0, yaw)  # (roll, pitch, yaw) — Python Rotator sırası
    if isinstance(asset, unreal.Blueprint):
        actor = actor_sub.spawn_actor_from_object(asset, loc, rot)
    else:
        mesh_path, scale = PLACEHOLDER.get(kind, ("/Engine/BasicShapes/Cube", (1, 1, 1)))
        mesh = asset if isinstance(asset, unreal.StaticMesh) else unreal.EditorAssetLibrary.load_asset(mesh_path)
        actor = actor_sub.spawn_actor_from_object(mesh, loc, rot)
        if not isinstance(asset, unreal.StaticMesh):
            actor.set_actor_scale3d(unreal.Vector(*scale))
            # temel şekiller merkezden ölçeklenir: tabanı zemine oturt
            actor.set_actor_location(loc + unreal.Vector(0, 0, scale[2] * 50.0), False, False)
    if actor and folder:
        actor.set_folder_path(folder)
    return actor


def build_roads(layout: dict) -> int:
    n = 0
    surface_enum = {"Asfalt": unreal.RizeSurface.ASFALT, "ArnavutKaldirimi": unreal.RizeSurface.ARNAVUT_KALDIRIMI,
                    "Beton": unreal.RizeSurface.BETON, "Toprak": unreal.RizeSurface.TOPRAK}
    for i, road in enumerate(layout["roads"]):
        if road["highway"] not in core.DRIVABLE:
            continue
        pts = core.simplify(road["points"], 50.0)
        first = unreal.Vector(*pts[0])
        actor = actor_sub.spawn_actor_from_class(unreal.RizeRoadPath, first, unreal.Rotator())
        actor.set_editor_property("path_id", core.path_id_for_road(road, i))
        actor.set_editor_property("speed_limit_kmh", float(road["speed_kmh"]))
        actor.set_editor_property("surface", surface_enum.get(road["surface"], unreal.RizeSurface.ASFALT))
        actor.set_editor_property("loop", False)  # UE Python bool adlarındaki "b" önekini atar
        spline = actor.get_editor_property("spline")
        spline.clear_spline_points(False)
        for p in pts:
            spline.add_spline_point(unreal.Vector(p[0], p[1], p[2] + 5.0), unreal.SplineCoordinateSpace.WORLD, False)
        spline.update_spline()
        label = road["name"] or road["highway"]
        actor.set_actor_label(f"Yol_{label}_{road.get('osm_id', i)}")
        actor.set_folder_path(core.chunk_folder("Yollar", pts[0][0], pts[0][1]))
        n += 1
    return n


def _extrude_building(b: dict):
    """Geometry Script varsa gerçek taban izi ekstrüzyonu; yoksa yönlü kutu."""
    fp = [(p[0], p[1]) for p in b["footprint"]]
    base = b["base_z_cm"]
    height_cm = b["height_m"] * 100.0 + b["slope_drop_m"] * 100.0  # yamaçta arka taraf gömülür
    try:
        actor = actor_sub.spawn_actor_from_class(unreal.DynamicMeshActor, unreal.Vector(0, 0, base), unreal.Rotator())
        mesh = actor.get_dynamic_mesh_component().get_dynamic_mesh()
        poly = [unreal.Vector2D(x, y) for (x, y) in fp]
        unreal.GeometryScript_Primitives.append_simple_extrude_polygon(
            mesh, unreal.GeometryScriptPrimitiveOptions(), unreal.Transform(), poly, height_cm, 0, True,
            unreal.GeometryScriptPrimitiveOriginMode.BASE)
        return actor
    except Exception as exc:  # eklenti kapalı ya da API farklı: güvenli geri dönüş
        unreal.log_warning(f"[Rize] Ekstrüzyon kullanılamadı ({exc}); yönlü kutu yer tutucu")
        if "actor" in locals() and actor:
            actor.destroy_actor()
    box = core.min_area_rect(fp)
    cube = unreal.EditorAssetLibrary.load_asset("/Engine/BasicShapes/Cube")
    actor = actor_sub.spawn_actor_from_object(cube, unreal.Vector(box.cx, box.cy, base + height_cm / 2), unreal.Rotator(0, 0, box.yaw_deg))
    actor.set_actor_scale3d(unreal.Vector(box.length / 100.0, box.width / 100.0, height_cm / 100.0))
    return actor


def build_buildings(layout: dict) -> int:
    n = 0
    with unreal.ScopedSlowTask(len(layout["buildings"]), "Rize binaları") as task:
        task.make_dialog(True)
        for b in layout["buildings"]:
            if task.should_cancel():
                break
            task.enter_progress_frame(1)
            if core.polygon_area([(p[0], p[1]) for p in b["footprint"]]) < 4.0e4:  # < 4 m²: kulübe/gürültü
                continue
            actor = _extrude_building(b)
            if not actor:
                continue
            name = b["name"] or b["type"]
            actor.set_actor_label(f"Bina_{name}_{b['osm_id']}_{b['levels']}kat")
            actor.set_folder_path(core.chunk_folder("Binalar", b["footprint"][0][0], b["footprint"][0][1]))
            n += 1
    return n


def build_points(layout: dict, key: str, kind: str, folder: str) -> int:
    n = 0
    for item in layout.get(key, []):
        loc = unreal.Vector(*item["pos"])
        yaw = item.get("yaw_deg", 0.0)
        if _spawn_static(kind, loc, yaw, core.chunk_folder(folder, item["pos"][0], item["pos"][1])):
            n += 1
    return n


def build_handrails(layout: dict, post_spacing_cm: float = 150.0) -> int:
    n = 0
    for rail in layout.get("handrails", []):
        pts = rail["points"]
        for i in range(len(pts) - 1):
            a, b = unreal.Vector(*pts[i]), unreal.Vector(*pts[i + 1])
            seg = (b - a).length()
            steps = max(1, int(seg // post_spacing_cm))
            for k in range(steps + 1):
                p = a + (b - a) * (k / steps)
                if _spawn_static("handrail_post", p, 0.0, core.chunk_folder("Korkuluklar", p.x, p.y)):
                    n += 1
    return n


def build_stops(layout: dict) -> int:
    n = 0
    for s in layout.get("bus_stops", []):
        actor = actor_sub.spawn_actor_from_class(unreal.RizeDolmusStop, unreal.Vector(*s["pos"]), unreal.Rotator())
        actor.set_editor_property("display_name", s["name"] or "Durak")
        actor.set_actor_label(f"Durak_{s['name'] or s['osm_id']}")
        actor.set_folder_path("Rize/Duraklar")
        n += 1
    return n


def run(region: str = "merkez", parts: tuple = ("roads", "buildings", "lamps", "drains", "poles", "bins", "rails", "stops")) -> dict:
    layout = load_layout(region)
    log_landscape_instructions(region)
    result = {}
    with unreal.ScopedEditorTransaction(f"Rize yerleşimi içe aktar ({region})"):
        if "roads" in parts:     result["roads"] = build_roads(layout)
        if "buildings" in parts: result["buildings"] = build_buildings(layout)
        if "lamps" in parts:     result["lamps"] = build_points(layout, "street_lamps", "street_lamp", "Lambalar")
        if "drains" in parts:    result["drains"] = build_points(layout, "storm_drains", "storm_drain", "Izgaralar")
        if "poles" in parts:     result["poles"] = build_points(layout, "utility_poles", "utility_pole", "Direkler")
        if "bins" in parts:      result["bins"] = build_points(layout, "trash_bins", "trash_bin", "CopKovalari")
        if "rails" in parts:     result["rails"] = build_handrails(layout)
        if "stops" in parts:     result["stops"] = build_stops(layout)
    unreal.log(f"[Rize] İçe aktarım tamam: {result}")
    return result
