"""Content/Data/*.json tutarlılık denetimi. Tasarımcı veri düzenledikten sonra çalıştırır.

    python3 Tools/validate_data.py            # hata varsa çıkış kodu 1
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "Content" / "Data"
PHASES = {"Safak", "Sabah", "Ogle", "Ikindi", "Aksam", "Gece"}
WEATHERS = {"Acik", "Bulutlu", "Cisenti", "Saganak", "Sis"}
SHOP_TYPES = {"bakkal", "market", "firin", "balikci", "cay_ocagi", "kiraathane", "lokanta", "galeri", "tamirci"}
VEHICLE_KINDS = {"binek", "hafif_ticari", "motor", "dolmus"}


def validate(data_dir: Path = DATA) -> list[str]:
    errors: list[str] = []

    def load(name):
        try:
            return json.loads((data_dir / name).read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{name}: okunamadı ({exc})")
            return []

    def unique_ids(name, items):
        seen = set()
        for it in items:
            i = it.get("id")
            if not i:
                errors.append(f"{name}: kimliksiz kayıt {it}")
            elif i in seen:
                errors.append(f"{name}: yinelenen kimlik '{i}'")
            seen.add(i)
        return seen

    def hour_ok(v):
        return isinstance(v, (int, float)) and 0 <= v <= 24

    products = load("products.json")
    pids = unique_ids("products.json", products)
    for p in products:
        if not isinstance(p.get("priceKurus"), int) or p["priceKurus"] <= 0:
            errors.append(f"products.json: '{p.get('id')}' fiyatı kuruş cinsinden pozitif tam sayı olmalı")
        if not p.get("name"):
            errors.append(f"products.json: '{p.get('id')}' adı boş")

    shops = load("shops.json")
    unique_ids("shops.json", shops)
    for s in shops:
        sid = s.get("id")
        if s.get("type") not in SHOP_TYPES:
            errors.append(f"shops.json: '{sid}' bilinmeyen tür '{s.get('type')}'")
        if not hour_ok(s.get("openHour")) or not hour_ok(s.get("closeHour")):
            errors.append(f"shops.json: '{sid}' çalışma saatleri 0..24 olmalı")
        for d in s.get("closedWeekdays", []):
            if d not in range(7):
                errors.append(f"shops.json: '{sid}' kapalı gün 0..6 olmalı ({d})")
        seen = set()
        for st in s.get("products", []):
            if st.get("productId") not in pids:
                errors.append(f"shops.json: '{sid}' tanımsız ürün '{st.get('productId')}'")
            if st.get("productId") in seen:
                errors.append(f"shops.json: '{sid}' ürünü iki kez listeliyor '{st.get('productId')}'")
            seen.add(st.get("productId"))
            if st.get("stock", 0) < 0:
                errors.append(f"shops.json: '{sid}' negatif stok")

    lines = load("dolmus_lines.json")
    unique_ids("dolmus_lines.json", lines)
    for ln in lines:
        lid = ln.get("id")
        if not ln.get("pathId"):
            errors.append(f"dolmus_lines.json: '{lid}' pathId boş")
        if ln.get("fareKurus", 0) <= 0:
            errors.append(f"dolmus_lines.json: '{lid}' ücret pozitif olmalı")
        if not (hour_ok(ln.get("firstDepartureHour")) and hour_ok(ln.get("lastDepartureHour"))) or ln["firstDepartureHour"] >= ln["lastDepartureHour"]:
            errors.append(f"dolmus_lines.json: '{lid}' sefer saatleri hatalı")
        if ln.get("headwayMinutes", 0) <= 0 or not 0 < ln.get("rushHeadwayFactor", 1) <= 1:
            errors.append(f"dolmus_lines.json: '{lid}' sefer aralığı/yoğun saat çarpanı hatalı")
        stops = [s.get("id") for s in ln.get("stops", [])]
        if len(stops) < 2:
            errors.append(f"dolmus_lines.json: '{lid}' en az iki durak olmalı")
        if len(stops) != len(set(stops)):
            errors.append(f"dolmus_lines.json: '{lid}' yinelenen durak")

    schedules = load("schedules.json")
    unique_ids("schedules.json", schedules)
    for sc in schedules:
        for e in sc.get("entries", []):
            if not (hour_ok(e.get("from")) and hour_ok(e.get("to"))):
                errors.append(f"schedules.json: '{sc.get('id')}' saat aralığı 0..24 olmalı: {e}")
            if not 0 < e.get("weekdays", 127) <= 127:
                errors.append(f"schedules.json: '{sc.get('id')}' gün maskesi 1..127 olmalı")
            if not e.get("activity") or not e.get("location"):
                errors.append(f"schedules.json: '{sc.get('id')}' etkinlik/konum boş")

    dialogue = load("dialogue.json")
    unique_ids("dialogue.json", dialogue)
    for d in dialogue:
        for ph in d.get("phases", []):
            if ph not in PHASES:
                errors.append(f"dialogue.json: '{d.get('id')}' bilinmeyen faz '{ph}'")
        for w in d.get("weathers", []):
            if w not in WEATHERS:
                errors.append(f"dialogue.json: '{d.get('id')}' bilinmeyen hava '{w}'")
        if not d.get("text"):
            errors.append(f"dialogue.json: '{d.get('id')}' metin boş")

    vehicles = load("vehicles.json")
    unique_ids("vehicles.json", vehicles)
    for v in vehicles:
        if v.get("kind") not in VEHICLE_KINDS:
            errors.append(f"vehicles.json: '{v.get('id')}' bilinmeyen tür '{v.get('kind')}'")
        if not str(v.get("vehicleClass", "")).startswith("/Game/") or not str(v.get("vehicleClass", "")).endswith("_C"):
            errors.append(f"vehicles.json: '{v.get('id')}' vehicleClass '/Game/…_C' biçiminde olmalı")
    return errors


def main() -> int:
    errs = validate()
    for e in errs:
        print("HATA:", e)
    print(f"{len(errs)} hata" if errs else "Veri dosyaları tutarlı.")
    return 1 if errs else 0


if __name__ == "__main__":
    raise SystemExit(main())
