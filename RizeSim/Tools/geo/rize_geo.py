"""Rize coğrafi referansı ve koordinat dönüşümleri.

Dünya kuralı (Unreal):  +X = Doğu, +Y = Güney, +Z = Yukarı, birim = cm.
UE sol el koordinat sistemi kullandığı için kuzey -Y yönündedir; böylece harita
ayna görüntüsüne dönmez. Aynı kural ARizeSkyController'da güneş yönü için kullanılır.

Projeksiyon: başlangıç noktası etrafında yerel teğet düzlem (eşdikdörtgen,
WGS84 meridyen/paralel yay uzunluklarıyla). 10 km ölçeğinde hata < 0,1 m.
"""
from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Region:
    """Oynanabilir bölge: merkez ve kare kenar uzunluğu (m)."""

    key: str
    name: str
    lat: float
    lon: float
    size_m: float
    landscape_px: int  # UE önerilen boyutlar: 1009, 2017, 4033, 8129

    def bbox(self) -> tuple[float, float, float, float]:
        """(güney, batı, kuzey, doğu) derece."""
        half = self.size_m / 2.0
        dlat = half / meters_per_deg_lat(self.lat)
        dlon = half / meters_per_deg_lon(self.lat)
        return (self.lat - dlat, self.lon - dlon, self.lat + dlat, self.lon + dlon)


REGIONS: dict[str, Region] = {
    # Sahil şeridi, çarşı, Tophane/Müftü/Piriçelebi yamaçları, kale ve kuzeyde deniz
    "merkez": Region("merkez", "Rize Merkez", 41.0200, 40.5220, 5600.0, 2017),
    # Ayder yaylası ve çevresi (ayrı World Partition bölgesi / ayrı harita)
    "ayder": Region("ayder", "Ayder Yaylası", 40.9530, 41.1040, 4000.0, 1009),
}


def meters_per_deg_lat(lat_deg: float) -> float:
    p = math.radians(lat_deg)
    return 111132.954 - 559.822 * math.cos(2 * p) + 1.175 * math.cos(4 * p)


def meters_per_deg_lon(lat_deg: float) -> float:
    p = math.radians(lat_deg)
    return 111412.84 * math.cos(p) - 93.5 * math.cos(3 * p)


@dataclass(frozen=True)
class LocalFrame:
    """Bölge merkezli yerel çerçeve. Metre ve Unreal cm dönüşümleri."""

    lat0: float
    lon0: float

    @classmethod
    def for_region(cls, r: Region) -> "LocalFrame":
        return cls(r.lat, r.lon)

    def to_en(self, lat: float, lon: float) -> tuple[float, float]:
        """(doğu, kuzey) metre."""
        return ((lon - self.lon0) * meters_per_deg_lon(self.lat0),
                (lat - self.lat0) * meters_per_deg_lat(self.lat0))

    def from_en(self, east: float, north: float) -> tuple[float, float]:
        return (self.lat0 + north / meters_per_deg_lat(self.lat0),
                self.lon0 + east / meters_per_deg_lon(self.lat0))

    def to_ue(self, lat: float, lon: float, elev_m: float = 0.0) -> tuple[float, float, float]:
        """Unreal dünya konumu (cm): X=doğu, Y=güney, Z=yükseklik."""
        e, n = self.to_en(lat, lon)
        return (e * 100.0, -n * 100.0, elev_m * 100.0)


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371008.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


# ---- Web Mercator karo matematiği (yükseklik karoları için) -------------------

def lonlat_to_global_px(lon: float, lat: float, zoom: int, tile: int = 256) -> tuple[float, float]:
    n = tile * (2 ** zoom)
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y


def load_heights_m(path: str):
    """Yükseklik ızgarasını metre olarak yükler.

    .npy → doğrudan; .png → 16 bit yükseklik haritası + yanındaki *_landscape.json'dan
    gerçek metreye geri çevrilir (hassasiyet = aralık / 65535, Rize merkezde ~7 mm).
    """
    import json as _json
    import numpy as np
    if path.endswith(".npy"):
        return np.load(path)
    from PIL import Image
    meta_path = path.replace("_heightmap.png", "_landscape.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = _json.load(f)
    with Image.open(path) as im:
        raw = np.asarray(im).astype(np.float64)
    lo, hi = meta["min_elevation_m"], meta["max_elevation_m"]
    return (lo + raw / 65535.0 * (hi - lo)).astype(np.float32)
