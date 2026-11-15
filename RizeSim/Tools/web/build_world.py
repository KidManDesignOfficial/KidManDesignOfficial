"""Tarayıcı prototipi için dünya verisi üretir (Web/world_data.js).

Gerçek Rize merkez arazisinden 2,4 × 2,4 km'lik çarşı + yamaç kesiti alınır,
5 m ızgaraya örneklenir; kıyı yolu, duraklar, çay ocağı/bakkal ve binalar
araziden türetilir. Çıktı JS dosyası tek sayfalık prototipe gömülür.
"""
from __future__ import annotations

import base64
import json
import math
import os
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "Tools" / "geo"))
from rize_geo import REGIONS, load_heights_m  # noqa: E402

SIZE_M = 2400.0
N = 481                        # 5 m ızgara
CENTER_E, CENTER_N = 0.0, 300.0  # kesit merkezi (bölge merkezine göre, m)
rng = np.random.default_rng(1381193285)


def sample_grid():
    r = REGIONS["merkez"]
    h = load_heights_m(str(ROOT / "Content" / "Terrain" / "merkez_heightmap.png")).astype(np.float64)
    n0 = h.shape[0]
    m0 = r.size_m / (n0 - 1)
    east = CENTER_E + np.linspace(-SIZE_M / 2, SIZE_M / 2, N)
    north = CENTER_N + np.linspace(SIZE_M / 2, -SIZE_M / 2, N)   # satır 0 = kuzey
    E, Nn = np.meshgrid(east, north)
    fx = (E + r.size_m / 2) / m0
    fy = (r.size_m / 2 - Nn) / m0
    xi, yi = np.floor(fx).astype(int), np.floor(fy).astype(int)
    ax, ay = fx - xi, fy - yi
    g = h
    v = (g[yi, xi] * (1 - ax) + g[yi, xi + 1] * ax) * (1 - ay) + (g[yi + 1, xi] * (1 - ax) + g[yi + 1, xi + 1] * ax) * ay
    return v


def height_at(H, e, n):
    """Kesit-yerel (e, n) metre → yükseklik. e: -1200..1200 (doğu), n: -1200..1200 (kuzey)."""
    m = SIZE_M / (N - 1)
    fx = (e + SIZE_M / 2) / m
    fy = (SIZE_M / 2 - n) / m
    fx = min(max(fx, 0), N - 1.001); fy = min(max(fy, 0), N - 1.001)
    xi, yi = int(fx), int(fy)
    ax, ay = fx - xi, fy - yi
    return float((H[yi, xi] * (1 - ax) + H[yi, xi + 1] * ax) * (1 - ay) + (H[yi + 1, xi] * (1 - ax) + H[yi + 1, xi + 1] * ax) * ay)


def coast_road(H):
    """Her doğu sütununda kıyıdan ~35 m içeride, yumuşatılmış kıyı yolu."""
    m = SIZE_M / (N - 1)
    pts = []
    for j in range(0, N, 4):
        col = H[:, j]
        land = np.where(col > 1.5)[0]
        if len(land) == 0:
            continue
        i = land[0]
        e = -SIZE_M / 2 + j * m
        n = SIZE_M / 2 - i * m - 35.0
        pts.append([e, n])
    pts = np.array(pts)
    # yumuşat (hareketli ortalama, uçlar korunur)
    k = 7
    sm = pts.copy()
    for i in range(len(pts)):
        a, b = max(0, i - k), min(len(pts), i + k + 1)
        sm[i, 1] = pts[a:b, 1].mean()
    # yol kesitin içinde kalsın
    sm = sm[(np.abs(sm[:, 0]) < SIZE_M / 2 - 60) & (np.abs(sm[:, 1]) < SIZE_M / 2 - 60)]
    # 15 m aralıkla yeniden örnekle
    out = [sm[0]]
    acc = 0.0
    for i in range(1, len(sm)):
        seg = np.linalg.norm(sm[i] - sm[i - 1])
        d = sm[i] - sm[i - 1]
        t = 15.0 - acc
        while t <= seg:
            out.append(sm[i - 1] + d * (t / seg))
            t += 15.0
        acc = seg - (t - 15.0)
    road = [[round(float(p[0]), 1), round(float(p[1]), 1), round(max(1.0, height_at(H, p[0], p[1])) + 0.15, 2)] for p in out]
    return road


def dist_to_polyline(p, poly):
    best = 1e9
    for i in range(len(poly) - 1):
        a, b = poly[i], poly[i + 1]
        ab = b - a
        t = np.clip(np.dot(p - a, ab) / max(1e-9, np.dot(ab, ab)), 0, 1)
        best = min(best, np.linalg.norm(p - (a + ab * t)))
    return best


def buildings(H, road):
    poly = np.array([[p[0], p[1]] for p in road])
    gy, gx = np.gradient(H, SIZE_M / (N - 1))
    slope = np.hypot(gx, gy)
    out = []
    cell = 22.0
    for e0 in np.arange(-SIZE_M / 2 + 40, SIZE_M / 2 - 40, cell):
        for n0 in np.arange(-SIZE_M / 2 + 40, SIZE_M / 2 - 40, cell):
            e = e0 + rng.uniform(-5, 5); n = n0 + rng.uniform(-5, 5)
            z = height_at(H, e, n)
            if z < 2.5 or z > 230:
                continue
            m = SIZE_M / (N - 1)
            ii = int((SIZE_M / 2 - n) / m); jj = int((e + SIZE_M / 2) / m)
            s = slope[min(ii, N - 1), min(jj, N - 1)]
            if s > 0.55:
                continue
            dr = dist_to_polyline(np.array([e, n]), poly)
            if dr < 16:
                continue
            # yoğunluk: kıyıya yakın ve şehir merkezine yakın daha sık; yükseldikçe seyrek
            p = 0.85 * math.exp(-max(0, z - 15) / 90) * math.exp(-abs(e) / 900) + 0.08
            if dr < 120:
                p += 0.25
            if rng.uniform() > p:
                continue
            w = rng.uniform(9, 15); d = rng.uniform(9, 14)
            floors = int(np.clip(rng.normal(6 - z / 45, 1.3), 2, 9))
            # yola paralel yön
            k = int(np.argmin(np.linalg.norm(poly - [e, n], axis=1)))
            k2 = min(k + 1, len(poly) - 1); k1 = max(k - 1, 0)
            yaw = math.atan2(poly[k2][1] - poly[k1][1], poly[k2][0] - poly[k1][0]) if dr < 200 else rng.uniform(0, math.pi)
            corners = [height_at(H, e + dx, n + dy) for dx in (-w / 2, w / 2) for dy in (-d / 2, d / 2)]
            out.append([round(e, 1), round(n, 1), round(min(corners) - 1.5, 2), round(w, 1), round(d, 1),
                        floors, round(yaw, 3), round(max(corners) - min(corners), 2), int(rng.integers(0, 6))])
    return out


def main():
    H = sample_grid()
    road = coast_road(H)
    blds = buildings(H, road)

    # Duraklar: kıyı yolunda üç nokta
    L = len(road)
    stop_idx = [int(L * 0.18), int(L * 0.5), int(L * 0.82)]
    stops = [{"name": nm, "i": i} for nm, i in zip(["Liman", "Cumhuriyet Meydanı", "Sahil Parkı"], stop_idx)]

    # Çay ocağı ve bakkal: meydan durağının güney tarafında, yola 14 m
    def beside(i, off, along):
        a = np.array(road[max(i - 1, 0)][:2]); b = np.array(road[min(i + 1, L - 1)][:2])
        t = (b - a) / np.linalg.norm(b - a)
        nrm = np.array([-t[1], t[0]])  # sol = kuzey tarafı (deniz) → güney için eksi
        p = np.array(road[i][:2]) - nrm * off + t * along
        return [round(float(p[0]), 1), round(float(p[1]), 1), round(height_at(H, *p), 2), round(math.atan2(t[1], t[0]), 3)]

    # Başlangıç: mahalle evi (bölge merkezi, kesitte n = -300) — denize bakar
    home = [0.0, -CENTER_N, round(height_at(H, 0.0, -CENTER_N), 2)]
    # sahil başlangıcı (oyunda: meydan durağının 70 m gerisi) — kod tarafıyla aynı nokta yaklaşık
    sahil_i = max(0, stop_idx[1] - 5)
    spawns = [home[:2], road[sahil_i][:2]]
    blds = [b for b in blds if all(math.hypot(b[0] - s_[0], b[1] - s_[1]) > 22 for s_ in spawns)]
    mi = stop_idx[1]
    places = {"cay_ocagi": beside(mi, 16, -20), "bakkal": beside(mi, 16, 22), "kiraathane": beside(mi, 17, 60)}
    # bu mekanların çevresindeki binaları temizle
    keep = []
    for b in blds:
        if all(math.hypot(b[0] - p[0], b[1] - p[1]) > 18 for p in places.values()):
            keep.append(b)
    blds = keep


    lo, hi = float(H.min()), float(H.max())
    q = np.round((H - lo) / (hi - lo) * 65535).astype("<u2")
    data = {
        "n": N, "size": SIZE_M, "lo": round(lo, 3), "hi": round(hi, 3),
        "h": base64.b64encode(q.tobytes()).decode(),
        "road": road, "stops": stops, "places": places, "buildings": blds, "home": home,
        "origin": {"lat": 41.02 + CENTER_N / 111053.9, "lon": 40.522, "note": "Rize merkez, çarşı ve Müftü yamacı kesiti"},
    }
    # Oyun verisinden: ürünler ve replikler (gerçek JSON dosyalarından)
    prods = {p["id"]: p for p in json.loads((ROOT / "Content/Data/products.json").read_text(encoding="utf-8"))}
    data["menu"] = {
        "cay_ocagi": [prods[k] for k in ("cay_ince_belli", "oralet", "ayran_servis")],
        "bakkal": [prods[k] for k in ("simit", "ekmek", "su_05l", "gazete", "semsiye")],
        "kiraathane": [prods[k] for k in ("cay_ince_belli", "turk_kahvesi")],
    }
    data["dialogue"] = json.loads((ROOT / "Content/Data/dialogue.json").read_text(encoding="utf-8"))
    out = ROOT / "Web" / "world_data.js"
    out.write_text("window.RIZE_WORLD=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"ızgara {N}x{N}, yükseklik {lo:.1f}..{hi:.1f} m, yol {len(road)} nokta, bina {len(blds)}, "
          f"başlangıç {home}, boyut {out.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main()
