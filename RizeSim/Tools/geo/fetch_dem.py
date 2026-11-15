"""Gerçek Rize arazisini indirip Unreal Landscape için 16 bit yükseklik haritası üretir.

Kaynak: AWS Open Data "Terrain Tiles" (terrarium kodlaması). Karada çoğunlukla
NASA SRTM / USGS 3DEP kökenli, denizde ETOPO1/GEBCO batimetrisi. Ham çözünürlük
Türkiye için ~30 m'dir; daha ince ızgaraya bilineer örnekleme yapılır (yapay ayrıntı
eklenmez — dik yamaç mikro detayı Landscape malzemesi ve elle şekillendirme işidir).

Kullanım:
    python3 Tools/geo/fetch_dem.py merkez --zoom 14 --out Content/Terrain
    python3 Tools/geo/fetch_dem.py ayder  --zoom 14 --out Content/Terrain

Çıktılar (<out>/<bölge>_*):
    _heightmap.png      16 bit gri PNG (Landscape → Import from File)
    _heights_m.npy      float32 gerçek yükseklikler (m) — OSM içe aktarımında kullanılır
    _landscape.json     Landscape konum/ölçek değerleri (aşağıya bakın)
    _preview.png        gölgelendirilmiş önizleme (doküman/kontrol için)
"""
from __future__ import annotations

import argparse
import io
import json
import math
import os
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rize_geo import REGIONS, LocalFrame, Region, lonlat_to_global_px, meters_per_deg_lat, meters_per_deg_lon  # noqa: E402

TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
SEA_FLOOR_CLAMP_M = -15.0  # derin batimetri Z aralığını boşa harcamasın; sığ kıyı şelfi kalsın


def decode_terrarium(rgb: np.ndarray) -> np.ndarray:
    """Terrarium: yükseklik = (R*256 + G + B/256) - 32768 metre."""
    r, g, b = (rgb[..., i].astype(np.float64) for i in range(3))
    return (r * 256.0 + g + b / 256.0) - 32768.0


def fetch_tile(z: int, x: int, y: int, cache: Path) -> np.ndarray:
    path = cache / f"{z}_{x}_{y}.png"
    if not path.exists():
        cache.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers={"User-Agent": "rize-sim-terrain-tool/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            path.write_bytes(resp.read())
    with Image.open(path) as im:
        return decode_terrarium(np.asarray(im.convert("RGB")))


def build_mosaic(region: Region, zoom: int, cache: Path):
    s, w, n, e = region.bbox()
    x0, y0 = lonlat_to_global_px(w, n, zoom)
    x1, y1 = lonlat_to_global_px(e, s, zoom)
    tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256)
    rows = []
    for ty in range(ty0, ty1 + 1):
        rows.append(np.concatenate([fetch_tile(zoom, tx, ty, cache) for tx in range(tx0, tx1 + 1)], axis=1))
    mosaic = np.concatenate(rows, axis=0)
    return mosaic, tx0 * 256, ty0 * 256


def bilinear(img: np.ndarray, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    h, w = img.shape
    x = np.clip(x, 0, w - 1.001)
    y = np.clip(y, 0, h - 1.001)
    xi, yi = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - xi, y - yi
    a = img[yi, xi] * (1 - fx) + img[yi, xi + 1] * fx
    b = img[yi + 1, xi] * (1 - fx) + img[yi + 1, xi + 1] * fx
    return a * (1 - fy) + b * fy


def resample_to_grid(region: Region, mosaic: np.ndarray, ox: float, oy: float, zoom: int) -> np.ndarray:
    """Çıkış ızgarası: satır 0 = kuzey kenarı (UE -Y), sütun 0 = batı kenarı (UE -X)."""
    n_px = region.landscape_px
    half = region.size_m / 2.0
    east = np.linspace(-half, half, n_px)
    north = np.linspace(half, -half, n_px)
    E, N = np.meshgrid(east, north)
    lat = region.lat + N / meters_per_deg_lat(region.lat)
    lon = region.lon + E / meters_per_deg_lon(region.lat)
    scale = 256 * (2 ** zoom)
    gx = (lon + 180.0) / 360.0 * scale - ox
    s = np.sin(np.radians(lat))
    gy = (0.5 - np.log((1 + s) / (1 - s)) / (4 * math.pi)) * scale - oy
    return bilinear(mosaic, gx, gy)


def landscape_params(heights: np.ndarray, region: Region) -> dict:
    """UE Landscape: yükseklik(cm) = (değer - 32768) / 128 * ScaleZ + KonumZ.

    Tüm aralığı 0..65535'e yaymak için ScaleZ = aralık_cm * 128 / 65535 seçilir ve
    Landscape aktörü, değer 0 = en düşük nokta olacak şekilde Z'de konumlanır. Böylece
    dünya Z'si gerçek deniz seviyesine göre mutlak yüksekliktir (0 cm = deniz).
    """
    hmin, hmax = float(heights.min()), float(heights.max())
    rng_cm = max(1.0, (hmax - hmin) * 100.0)
    # UE: dünya Z(cm) = KonumZ + (v - 32768) / 128 * ScaleZ   (ScaleZ=100 → ±256 m aralık)
    scale_z = rng_cm * 128.0 / 65535.0
    loc_z = hmin * 100.0 + 32768.0 / 128.0 * scale_z
    xy_cm = region.size_m / (region.landscape_px - 1) * 100.0
    return {
        "region": region.key,
        "name": region.name,
        "center_lat": region.lat,
        "center_lon": region.lon,
        "size_m": region.size_m,
        "resolution_px": region.landscape_px,
        "meters_per_px": region.size_m / (region.landscape_px - 1),
        "min_elevation_m": round(hmin, 2),
        "max_elevation_m": round(hmax, 2),
        "landscape_scale": {"x": round(xy_cm, 4), "y": round(xy_cm, 4), "z": round(scale_z, 4)},
        # Landscape aktörü sol-üst köşeden büyür: konum = batı-kuzey köşesi
        "landscape_location_cm": {"x": round(-region.size_m * 50.0, 2), "y": round(-region.size_m * 50.0, 2), "z": round(loc_z, 2)},
        "sea_level_world_z_cm": 0.0,
        "axis_convention": "+X=Doğu, +Y=Güney, +Z=Yukarı (cm)",
        "source": "AWS Terrain Tiles (terrarium) — SRTM/USGS/ETOPO kökenli",
    }


def encode_heightmap(heights: np.ndarray) -> np.ndarray:
    hmin, hmax = heights.min(), heights.max()
    norm = (heights - hmin) / max(1e-6, hmax - hmin)
    return np.round(norm * 65535.0).astype(np.uint16)


def hillshade(heights: np.ndarray, m_per_px: float, az_deg: float = 315.0, alt_deg: float = 45.0) -> np.ndarray:
    gy, gx = np.gradient(heights, m_per_px)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(az_deg), math.radians(alt_deg)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    return np.clip(shade, 0, 1)


def make_preview(heights: np.ndarray, m_per_px: float, path: Path, max_px: int = 1024) -> None:
    shade = hillshade(heights, m_per_px)
    h = heights
    land = h > 0.5
    rgb = np.zeros(h.shape + (3,))
    # Deniz: koyu mavi; kara: yüksekliğe göre yeşil→kahve→gri tonları × gölge
    t = np.clip(h / max(1.0, float(h.max())), 0, 1)[..., None]
    low, mid, high = np.array([0.30, 0.50, 0.25]), np.array([0.45, 0.42, 0.28]), np.array([0.75, 0.75, 0.72])
    land_rgb = np.where(t < 0.5, low + (mid - low) * (t / 0.5), mid + (high - mid) * ((t - 0.5) / 0.5))
    rgb[land] = (land_rgb * (0.35 + 0.65 * shade[..., None]))[land]
    rgb[~land] = np.array([0.10, 0.22, 0.36])
    im = Image.fromarray((rgb * 255).astype(np.uint8))
    if max(im.size) > max_px:
        im = im.resize((max_px, max_px), Image.LANCZOS)
    im.save(path)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("region", choices=sorted(REGIONS))
    ap.add_argument("--zoom", type=int, default=14)
    ap.add_argument("--out", default="Content/Terrain")
    ap.add_argument("--cache", default="Tools/cache/dem")
    args = ap.parse_args(argv)

    region = REGIONS[args.region]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    mosaic, ox, oy = build_mosaic(region, args.zoom, Path(args.cache))
    heights = resample_to_grid(region, mosaic, ox, oy, args.zoom)
    heights = np.maximum(heights, SEA_FLOOR_CLAMP_M).astype(np.float32)

    Image.fromarray(encode_heightmap(heights)).save(out / f"{region.key}_heightmap.png")
    np.save(out / f"{region.key}_heights_m.npy", heights)
    params = landscape_params(heights, region)
    (out / f"{region.key}_landscape.json").write_text(json.dumps(params, ensure_ascii=False, indent=2), encoding="utf-8")
    make_preview(heights, params["meters_per_px"], out / f"{region.key}_preview.png")

    land = heights > 0.5
    print(f"{region.name}: {region.landscape_px}x{region.landscape_px} px, {params['meters_per_px']:.2f} m/px")
    print(f"  yükseklik {params['min_elevation_m']} … {params['max_elevation_m']} m, kara oranı %{100 * land.mean():.1f}")
    print(f"  Landscape ölçek {params['landscape_scale']}, konum {params['landscape_location_cm']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
