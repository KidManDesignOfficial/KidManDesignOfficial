"""Oyuncu evi başlangıç noktalarını gerçek araziden seçer → Content/Data/home_spawns.json

  * Sahil Dairesi : kıyıdan 60–150 m içeride, 3–15 m yükseklikte, düz zemin, merkeze en yakın
  * Mahalle Evi   : 50–140 m yükseklikte, %12–35 eğimli yamaç (dik yokuşlu mahalle), merkeze en yakın
  * Yayla Evi     : Ayder bölgesinde 1250–1450 m bandında, görece düz, bölge merkezine en yakın
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rize_geo import REGIONS, load_heights_m  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]


def grid_info(region_key: str):
    r = REGIONS[region_key]
    h = load_heights_m(str(ROOT / "Content" / "Terrain" / f"{region_key}_heightmap.png"))
    n = h.shape[0]
    m = r.size_m / (n - 1)
    gy, gx = np.gradient(h, m)
    slope = np.hypot(gx, gy)
    east = (np.arange(n) - (n - 1) / 2) * m
    north = ((n - 1) / 2 - np.arange(n)) * m
    E, N = np.meshgrid(east, north)
    return r, h, slope, E, N, m


def distance_to_sea(h: np.ndarray, m: float) -> np.ndarray:
    """Kaba mesafe dönüşümü (iki geçişli şehir bloğu, metre)."""
    INF = 1e9
    d = np.where(h <= 0.5, 0.0, INF)
    n0, n1 = d.shape
    for i in range(n0):
        for j in range(1, n1):
            d[i, j] = min(d[i, j], d[i, j - 1] + m)
        for j in range(n1 - 2, -1, -1):
            d[i, j] = min(d[i, j], d[i, j + 1] + m)
    for j in range(n1):
        col = d[:, j]
        for i in range(1, n0):
            col[i] = min(col[i], col[i - 1] + m)
        for i in range(n0 - 2, -1, -1):
            col[i] = min(col[i], col[i + 1] + m)
    return d


def pick(mask, E, N, h, label, region_key):
    if not mask.any():
        raise SystemExit(f"{label}: uygun nokta bulunamadı")
    dist = np.where(mask, np.hypot(E, N), np.inf)
    i, j = np.unravel_index(np.argmin(dist), dist.shape)
    e, n, z = float(E[i, j]), float(N[i, j]), float(h[i, j])
    return {"label": label, "map": region_key, "player_start_tag": None,
            "location_cm": [round(e * 100, 1), round(-n * 100, 1), round(z * 100 + 100, 1)],
            "elevation_m": round(z, 1)}


def main() -> int:
    r, h, slope, E, N, m = grid_info("merkez")
    # Hız için 4x seyrekleştirilmiş ızgarada deniz mesafesi
    k = 4
    ds = distance_to_sea(h[::k, ::k], m * k)
    ds = np.kron(ds, np.ones((k, k)))[: h.shape[0], : h.shape[1]]

    sahil = (ds > 60) & (ds < 150) & (h > 3) & (h < 15) & (slope < 0.06)
    mahalle = (h > 50) & (h < 140) & (slope > 0.12) & (slope < 0.35)
    homes = {
        "SahilDairesi": pick(sahil, E, N, h, "Sahil Dairesi", "merkez") | {"player_start_tag": "Ev_Sahil"},
        "MahalleEvi": pick(mahalle, E, N, h, "Yokuşlu Mahalle Evi", "merkez") | {"player_start_tag": "Ev_Mahalle"},
    }
    ra, ha, sa, Ea, Na, _ = grid_info("ayder")
    yayla = (ha > 1250) & (ha < 1450) & (sa < 0.15)
    homes["YaylaEvi"] = pick(yayla, Ea, Na, ha, "Yayla Evi", "ayder") | {"player_start_tag": "Ev_Yayla"}

    out = ROOT / "Content" / "Data" / "home_spawns.json"
    out.write_text(json.dumps(homes, ensure_ascii=False, indent=2), encoding="utf-8")
    for k_, v in homes.items():
        print(f"{k_:13s} {v['map']:7s} yükseklik {v['elevation_m']:7.1f} m  konum {v['location_cm']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
