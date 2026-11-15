"""OpenStreetMap verisini Rize simülasyonu yerleşim dosyasına dönüştürür.

OSM'den gelenler: yollar, yaya yolları, merdivenler, binalar (taban izi + kat),
dükkan/mekan noktaları, sokak lambaları, otobüs/dolmuş durakları, elektrik hatları,
ağaçlar, kıyı çizgisi.

OSM'de genellikle EKSİK olan ama gerçek sokakta bulunan altyapı türetilir
("gerçek hayatta ne varsa" ilkesi):
  * bordür taşları      — araç yollarının iki kenarı (kaldırım yoksa atlanır)
  * yağmur suyu ızgarası — eğimli yollarda alçak tarafta ~25 m'de bir + çukur noktalarda
  * sokak lambası        — OSM'de lamba yoksa ~30 m'de bir, karşılıklı zikzak
  * demir korkuluk       — merdivenlerin iki yanı (Rize'nin dik merdivenli sokakları)
  * elektrik direği/teli — OSM'de hat yoksa mahalle yollarında ~40 m'de bir direk + aralarında tel
  * çöp kovası           — dükkan/mekan önlerinde ve yaya yollarında ~120 m'de bir

Tüm konumlar Unreal cm'dir (+X doğu, +Y güney, +Z yukarı). Yükseklik verilirse
(fetch_dem.py çıktısı) her noktanın Z'si gerçek araziden örneklenir.

Kullanım:
    python3 Tools/geo/osm_to_rize.py Tools/cache/rize_merkez.osm \\
        --region merkez --heights Content/Terrain/merkez_heightmap.png \\
        --out Content/Data/layout_merkez.json
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rize_geo import REGIONS, LocalFrame, Region, load_heights_m  # noqa: E402

# ---- Sınıflandırma tabloları --------------------------------------------------

ROAD_WIDTH_M = {
    "motorway": 14.0, "trunk": 12.0, "primary": 10.0, "secondary": 8.0, "tertiary": 7.0,
    "unclassified": 5.0, "residential": 5.5, "living_street": 4.0, "service": 3.5,
    "track": 3.0, "primary_link": 6.0, "secondary_link": 6.0, "tertiary_link": 5.0,
}
PED_WIDTH_M = {"pedestrian": 6.0, "footway": 2.0, "path": 1.2, "steps": 1.8, "cycleway": 2.0, "corridor": 2.0}
SPEED_KMH = {"primary": 50, "secondary": 50, "tertiary": 40, "residential": 30, "living_street": 20,
             "service": 20, "unclassified": 30, "track": 20, "trunk": 70, "motorway": 90}
SURFACE = {
    "asphalt": "Asfalt", "paved": "Asfalt", "concrete": "Beton", "concrete:plates": "Beton",
    "sett": "ArnavutKaldirimi", "cobblestone": "ArnavutKaldirimi", "unhewn_cobblestone": "ArnavutKaldirimi",
    "paving_stones": "ArnavutKaldirimi", "unpaved": "Toprak", "dirt": "Toprak", "gravel": "Toprak",
    "ground": "Toprak", "compacted": "Toprak", "grass": "Toprak",
}
DEFAULT_LEVELS = {"house": 2, "detached": 2, "residential": 3, "apartments": 5, "commercial": 4,
                  "retail": 2, "mosque": 1, "school": 3, "hospital": 5, "public": 4, "garage": 1,
                  "shed": 1, "roof": 1, "industrial": 2, "warehouse": 2, "yes": 4}
STOREY_M = 3.0

LAMP_SPACING_M = 30.0
DRAIN_SPACING_M = 25.0
POLE_SPACING_M = 40.0
BIN_SPACING_M = 120.0
MIN_GRADE_FOR_DRAIN = 0.01


# ---- Yardımcılar -----------------------------------------------------------------

@dataclass
class Heights:
    """fetch_dem.py ızgarasından bilineer yükseklik örnekleme."""

    grid: "object"  # numpy dizisi
    size_m: float

    @classmethod
    def load(cls, path: Optional[str], region: Region) -> Optional["Heights"]:
        if not path:
            return None
        return cls(load_heights_m(path), region.size_m)

    def at(self, east: float, north: float) -> float:
        g = self.grid
        n = g.shape[0]
        half = self.size_m / 2.0
        fx = (east + half) / self.size_m * (n - 1)
        fy = (half - north) / self.size_m * (n - 1)
        fx = min(max(fx, 0.0), n - 1.001)
        fy = min(max(fy, 0.0), n - 1.001)
        xi, yi = int(fx), int(fy)
        ax, ay = fx - xi, fy - yi
        a = g[yi, xi] * (1 - ax) + g[yi, xi + 1] * ax
        b = g[yi + 1, xi] * (1 - ax) + g[yi + 1, xi + 1] * ax
        return float(max(0.0, a * (1 - ay) + b * ay))


@dataclass
class Ctx:
    frame: LocalFrame
    region: Region
    heights: Optional[Heights]
    half_m: float = field(init=False)

    def __post_init__(self):
        self.half_m = self.region.size_m / 2.0

    def en(self, lat: float, lon: float) -> tuple[float, float]:
        return self.frame.to_en(lat, lon)

    def inside(self, e: float, n: float) -> bool:
        return abs(e) <= self.half_m and abs(n) <= self.half_m

    def z(self, e: float, n: float) -> float:
        return self.heights.at(e, n) if self.heights else 0.0

    def ue(self, e: float, n: float, z_m: Optional[float] = None) -> list[float]:
        zz = self.z(e, n) if z_m is None else z_m
        return [round(e * 100.0, 1), round(-n * 100.0, 1), round(zz * 100.0, 1)]


def parse_float(v: Optional[str]) -> Optional[float]:
    if v is None:
        return None
    try:
        return float(v.replace(",", ".").split()[0].rstrip("m"))
    except (ValueError, IndexError):
        return None


def polyline_length(pts: list[tuple[float, float]]) -> float:
    return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def resample(pts: list[tuple[float, float]], spacing: float, start: float = 0.0):
    """Çoklu çizgi boyunca eşit aralıklı noktalar: (e, n, yön_e, yön_n, mesafe)."""
    out = []
    target = start
    walked = 0.0
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        seg = math.dist(pts[i], pts[i + 1])
        if seg < 1e-6:
            continue
        dx, dy = (x1 - x0) / seg, (y1 - y0) / seg
        while target <= walked + seg:
            t = target - walked
            out.append((x0 + dx * t, y0 + dy * t, dx, dy, target))
            target += spacing
        walked += seg
    return out


def offset_polyline(pts: list[tuple[float, float]], d: float) -> list[tuple[float, float]]:
    """Sola (+d) / sağa (-d) paralel kaydırma; köşelerde açıortay ile."""
    if len(pts) < 2:
        return list(pts)
    out = []
    for i, p in enumerate(pts):
        if i == 0:
            a, b = pts[0], pts[1]
            nx, ny = -(b[1] - a[1]), b[0] - a[0]
        elif i == len(pts) - 1:
            a, b = pts[-2], pts[-1]
            nx, ny = -(b[1] - a[1]), b[0] - a[0]
        else:
            a, b, c = pts[i - 1], p, pts[i + 1]
            n1 = (-(b[1] - a[1]), b[0] - a[0])
            n2 = (-(c[1] - b[1]), c[0] - b[0])
            l1, l2 = math.hypot(*n1) or 1, math.hypot(*n2) or 1
            nx, ny = n1[0] / l1 + n2[0] / l2, n1[1] / l1 + n2[1] / l2
            ln = math.hypot(nx, ny) or 1
            nx, ny = nx / ln, ny / ln
            # köşe uzaması (miter), aşırı sivri köşelerde sınırla
            cos_half = max(0.35, (n1[0] * nx + n1[1] * ny) / l1)
            out.append((p[0] + nx * d / cos_half, p[1] + ny * d / cos_half))
            continue
        ln = math.hypot(nx, ny) or 1
        out.append((p[0] + nx / ln * d, p[1] + ny / ln * d))
    return out


class SpatialHash:
    """Yakınlık sorguları için basit ızgara (örn. 'burada zaten lamba var mı?')."""

    def __init__(self, cell: float):
        self.cell = cell
        self.buckets: dict[tuple[int, int], list[tuple[float, float]]] = {}

    def add(self, e: float, n: float) -> None:
        self.buckets.setdefault((int(e // self.cell), int(n // self.cell)), []).append((e, n))

    def near(self, e: float, n: float, r: float) -> bool:
        cx, cy = int(e // self.cell), int(n // self.cell)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for (x, y) in self.buckets.get((cx + dx, cy + dy), ()):
                    if (x - e) ** 2 + (y - n) ** 2 <= r * r:
                        return True
        return False


# ---- OSM okuma -------------------------------------------------------------------

def read_osm(path: str):
    nodes: dict[str, tuple[float, float, dict]] = {}
    ways: list[tuple[str, list[str], dict]] = []
    for _, el in ET.iterparse(path, events=("end",)):
        if el.tag == "node":
            tags = {t.get("k"): t.get("v") for t in el.findall("tag")}
            nodes[el.get("id")] = (float(el.get("lat")), float(el.get("lon")), tags)
            el.clear()
        elif el.tag == "way":
            refs = [nd.get("ref") for nd in el.findall("nd")]
            tags = {t.get("k"): t.get("v") for t in el.findall("tag")}
            ways.append((el.get("id"), refs, tags))
            el.clear()
    return nodes, ways


# ---- Dönüştürme ------------------------------------------------------------------

def convert(osm_path: str, region: Region, heights_path: Optional[str] = None) -> dict:
    ctx = Ctx(LocalFrame.for_region(region), region, Heights.load(heights_path, region))
    nodes, ways = read_osm(osm_path)

    def way_en(refs: list[str]) -> list[tuple[float, float]]:
        pts = [ctx.en(nodes[r][0], nodes[r][1]) for r in refs if r in nodes]
        return [p for p in pts if ctx.inside(*p)]

    L: dict[str, list] = {k: [] for k in (
        "roads", "footways", "steps", "buildings", "pois", "street_lamps", "bus_stops",
        "storm_drains", "curbs", "handrails", "utility_poles", "overhead_wires", "power_lines",
        "trash_bins", "trees", "coastline", "water")}

    lamps = SpatialHash(25.0)
    poles = SpatialHash(25.0)
    bins = SpatialHash(25.0)

    # Düğüm nesneleri
    for nid, (lat, lon, tags) in nodes.items():
        if not tags:
            continue
        e, n = ctx.en(lat, lon)
        if not ctx.inside(e, n):
            continue
        hw = tags.get("highway")
        if hw == "street_lamp":
            L["street_lamps"].append({"pos": ctx.ue(e, n), "source": "osm"})
            lamps.add(e, n)
        elif hw == "bus_stop":
            L["bus_stops"].append({"pos": ctx.ue(e, n), "name": tags.get("name", ""), "osm_id": nid})
        elif tags.get("power") in ("pole", "tower"):
            L["utility_poles"].append({"pos": ctx.ue(e, n), "source": "osm"})
            poles.add(e, n)
        elif tags.get("natural") == "tree":
            L["trees"].append({"pos": ctx.ue(e, n), "species": tags.get("species", tags.get("leaf_type", ""))})
        if "shop" in tags or "amenity" in tags:
            kind = tags.get("shop") or tags.get("amenity")
            L["pois"].append({"pos": ctx.ue(e, n), "kind": kind, "category": "shop" if "shop" in tags else "amenity",
                              "name": tags.get("name", ""), "opening_hours": tags.get("opening_hours", ""), "osm_id": nid})

    # Yollar
    for wid, refs, tags in ways:
        pts = way_en(refs)
        if len(pts) < 2:
            continue
        hw = tags.get("highway")
        if hw in ROAD_WIDTH_M:
            lanes = int(parse_float(tags.get("lanes")) or (1 if tags.get("oneway") == "yes" else 2))
            width = parse_float(tags.get("width")) or ROAD_WIDTH_M[hw]
            surface = SURFACE.get(tags.get("surface", "asphalt"), "Asfalt")
            limit = parse_float(tags.get("maxspeed")) or SPEED_KMH.get(hw, 30)
            pts3 = [ctx.ue(e, n) for e, n in pts]
            length = polyline_length(pts)
            rise = (pts3[-1][2] - pts3[0][2]) / 100.0
            L["roads"].append({"osm_id": wid, "highway": hw, "name": tags.get("name", ""), "width_m": width,
                               "lanes": lanes, "oneway": tags.get("oneway") == "yes", "surface": surface,
                               "speed_kmh": limit, "length_m": round(length, 1),
                               "avg_grade": round(rise / length, 4) if length > 0 else 0.0, "points": pts3})
            derive_road_infrastructure(ctx, pts, width, tags, L, lamps, poles)
        elif hw == "steps":
            width = parse_float(tags.get("width")) or PED_WIDTH_M["steps"]
            pts3 = [ctx.ue(e, n) for e, n in pts]
            L["steps"].append({"osm_id": wid, "width_m": width, "name": tags.get("name", ""),
                               "step_count": int(parse_float(tags.get("step_count")) or 0), "points": pts3})
            # Merdivenin iki yanına demir korkuluk (OSM 'handrail=no' demedikçe)
            if tags.get("handrail") != "no":
                for side in (1, -1):
                    rail = offset_polyline(pts, side * (width / 2.0 - 0.1))
                    L["handrails"].append({"of": wid, "points": [ctx.ue(e, n) for e, n in rail], "height_m": 0.95})
        elif hw in PED_WIDTH_M:
            width = parse_float(tags.get("width")) or PED_WIDTH_M[hw]
            L["footways"].append({"osm_id": wid, "kind": hw, "width_m": width,
                                  "surface": SURFACE.get(tags.get("surface", "paving_stones"), "ArnavutKaldirimi"),
                                  "points": [ctx.ue(e, n) for e, n in pts]})
            for (e, n, dx, dy, _) in resample(pts, BIN_SPACING_M, BIN_SPACING_M / 2):
                if not bins.near(e, n, 40.0):
                    be, bn = e + (-dy) * (width / 2 + 0.4), n + dx * (width / 2 + 0.4)
                    L["trash_bins"].append({"pos": ctx.ue(be, bn), "source": "derived"})
                    bins.add(be, bn)

        # Binalar
        if "building" in tags or "building:part" in tags:
            ring = pts[:-1] if len(pts) > 2 and pts[0] == pts[-1] else pts
            if len(ring) < 3:
                continue
            btype = tags.get("building") or tags.get("building:part") or "yes"
            levels = parse_float(tags.get("building:levels"))
            height = parse_float(tags.get("height"))
            if height is None:
                lv = levels if levels is not None else DEFAULT_LEVELS.get(btype, 4)
                height = lv * STOREY_M + 1.0
            if levels is None:
                levels = max(1, round((height - 1.0) / STOREY_M))
            # Yamaçta bina: taban = en alçak köşe (ön cephe), arka taraf toprağa gömülür
            zs = [ctx.z(e, n) for e, n in ring]
            L["buildings"].append({
                "osm_id": wid, "type": btype, "name": tags.get("name", ""),
                "levels": int(levels), "height_m": round(height, 1),
                "base_z_cm": round(min(zs) * 100.0, 1), "slope_drop_m": round(max(zs) - min(zs), 2),
                "roof": tags.get("roof:shape", "hipped" if btype in ("house", "detached") else "flat"),
                "footprint": [[round(e * 100.0, 1), round(-n * 100.0, 1)] for e, n in ring],
                "shop": tags.get("shop", ""), "amenity": tags.get("amenity", ""),
            })
            if "shop" in tags or "amenity" in tags:
                ce = sum(p[0] for p in ring) / len(ring)
                cn = sum(p[1] for p in ring) / len(ring)
                L["pois"].append({"pos": ctx.ue(ce, cn), "kind": tags.get("shop") or tags.get("amenity"),
                                  "category": "shop" if "shop" in tags else "amenity", "name": tags.get("name", ""),
                                  "opening_hours": tags.get("opening_hours", ""), "osm_id": wid})

        if tags.get("power") in ("line", "minor_line"):
            L["power_lines"].append({"osm_id": wid, "kind": tags["power"], "points": [ctx.ue(e, n) for e, n in pts]})
        if tags.get("natural") == "coastline":
            L["coastline"].append({"osm_id": wid, "points": [ctx.ue(e, n, 0.0) for e, n in pts]})
        if tags.get("natural") == "water" or tags.get("waterway") in ("river", "stream", "canal"):
            L["water"].append({"osm_id": wid, "kind": tags.get("waterway", "water"), "points": [ctx.ue(e, n) for e, n in pts]})

    # Dükkan önlerine çöp kovası
    for poi in L["pois"]:
        e, n = poi["pos"][0] / 100.0, -poi["pos"][1] / 100.0
        if not bins.near(e, n, 30.0):
            L["trash_bins"].append({"pos": ctx.ue(e + 1.5, n), "source": "derived"})
            bins.add(e + 1.5, n)

    L["meta"] = {
        "region": region.key, "name": region.name, "center": [region.lat, region.lon], "size_m": region.size_m,
        "axis": "+X=Doğu, +Y=Güney, +Z=Yukarı (cm)", "source": os.path.basename(osm_path),
        "heights": os.path.basename(heights_path) if heights_path else None,
        "license": "Harita verisi © OpenStreetMap katkıcıları, ODbL 1.0",
    }
    L["stats"] = {k: len(v) for k, v in L.items() if isinstance(v, list)}
    L["stats"]["derived_lamps"] = sum(1 for x in L["street_lamps"] if x["source"] == "derived")
    return L


def derive_road_infrastructure(ctx: Ctx, pts, width: float, tags: dict, L: dict,
                               lamps: SpatialHash, poles: SpatialHash) -> None:
    hw = tags.get("highway")
    half = width / 2.0

    # Bordür: kaldırım bilgisi 'no/none' değilse iki yan
    sidewalk = tags.get("sidewalk", "both" if hw in ("primary", "secondary", "tertiary", "residential") else "no")
    if sidewalk not in ("no", "none", "separate"):
        sides = {"both": (1, -1), "left": (1,), "right": (-1,)}.get(sidewalk, (1, -1))
        for s in sides:
            curb = offset_polyline(pts, s * half)
            L["curbs"].append({"of": tags.get("name", ""), "side": "sol" if s > 0 else "sag",
                               "points": [ctx.ue(e, n) for e, n in curb], "height_cm": 15})

    # Sokak lambası: zikzak, mevcut lambaya 20 m'den yakınsa atla
    if hw not in ("track",):
        for i, (e, n, dx, dy, _) in enumerate(resample(pts, LAMP_SPACING_M, LAMP_SPACING_M / 2)):
            side = 1 if i % 2 == 0 else -1
            le, ln = e + (-dy) * side * (half + 0.6), n + dx * side * (half + 0.6)
            if not lamps.near(le, ln, 20.0):
                L["street_lamps"].append({"pos": ctx.ue(le, ln), "source": "derived",
                                          "facing": [round(dy * side, 3), round(-dx * side, 3)]})
                lamps.add(le, ln)

    # Yağmur ızgarası: eğimli yolda alçak tarafa doğru, bordür dibinde
    samples = resample(pts, DRAIN_SPACING_M / 5.0)
    zs = [ctx.z(e, n) for (e, n, *_r) in samples]
    for i in range(0, len(samples), 5):
        e, n, dx, dy, _ = samples[i]
        j0, j1 = max(0, i - 2), min(len(samples) - 1, i + 2)
        run = max(1e-3, (j1 - j0) * DRAIN_SPACING_M / 5.0)
        grade = (zs[j1] - zs[j0]) / run
        is_low = 0 < i < len(samples) - 1 and zs[i] <= zs[i - 1] and zs[i] <= zs[i + 1]
        if abs(grade) >= MIN_GRADE_FOR_DRAIN or is_low:
            for s in (1, -1):
                de, dn = e + (-dy) * s * (half - 0.25), n + dx * s * (half - 0.25)
                L["storm_drains"].append({"pos": ctx.ue(de, dn), "yaw_deg": round(math.degrees(math.atan2(-dy, dx)), 1),
                                          "grade": round(grade, 3)})

    # Elektrik direkleri + teller: mahalle yollarında, OSM'de direk yoksa
    if hw in ("residential", "unclassified", "living_street", "tertiary", "service"):
        prev = None
        for (e, n, dx, dy, _) in resample(pts, POLE_SPACING_M, 5.0):
            pe, pn = e + (-dy) * (half + 0.8), n + dx * (half + 0.8)
            if poles.near(pe, pn, 15.0):
                prev = None
                continue
            pos = ctx.ue(pe, pn)
            L["utility_poles"].append({"pos": pos, "source": "derived", "height_m": 9.0})
            poles.add(pe, pn)
            if prev is not None:
                L["overhead_wires"].append({"from": prev, "to": pos, "sag_m": 0.6, "count": 3})
            prev = pos


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("osm")
    ap.add_argument("--region", default="merkez", choices=sorted(REGIONS))
    ap.add_argument("--heights", default=None, help="*_heightmap.png (önerilen) ya da *_heights_m.npy")
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)

    layout = convert(args.osm, REGIONS[args.region], args.heights)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(layout, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(layout["stats"], ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
