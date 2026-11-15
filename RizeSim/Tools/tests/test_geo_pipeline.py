"""Coğrafya araçları testleri:  python3 -m unittest discover -s Tools/tests -v"""
import json
import math
import os
import sys
import tempfile
import unittest

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "geo"))

import fetch_dem  # noqa: E402
import osm_to_rize  # noqa: E402
import rize_geo  # noqa: E402
from rize_geo import REGIONS, LocalFrame, haversine_m, lonlat_to_global_px  # noqa: E402

FIXTURE = os.path.join(HERE, "fixtures", "mini_rize.osm")


class TestProjection(unittest.TestCase):
    def test_roundtrip(self):
        f = LocalFrame(41.02, 40.522)
        for lat, lon in [(41.03, 40.53), (41.0, 40.49), (41.045, 40.555)]:
            e, n = f.to_en(lat, lon)
            lat2, lon2 = f.from_en(e, n)
            self.assertAlmostEqual(lat, lat2, places=9)
            self.assertAlmostEqual(lon, lon2, places=9)

    def test_scale_matches_wgs84_ellipsoid(self):
        # Bağımsız referans: WGS84 elipsoidinde meridyen ve paralel yay uzunlukları
        a, e2 = 6378137.0, 6.69437999014e-3
        for lat in (40.95, 41.02):
            p = math.radians(lat)
            w = math.sqrt(1 - e2 * math.sin(p) ** 2)
            m_lat = math.pi / 180 * a * (1 - e2) / w ** 3
            m_lon = math.pi / 180 * a * math.cos(p) / w
            self.assertAlmostEqual(rize_geo.meters_per_deg_lat(lat), m_lat, delta=1.0)
            self.assertAlmostEqual(rize_geo.meters_per_deg_lon(lat), m_lon, delta=1.0)

    def test_distance_close_to_spherical(self):
        # Küresel haversine ile fark yalnızca küre yaklaşımı kadar olmalı (< %0,2)
        f = LocalFrame(41.02, 40.522)
        a, b = (41.010, 40.500), (41.040, 40.550)
        ea, na = f.to_en(*a)
        eb, nb = f.to_en(*b)
        d = math.hypot(eb - ea, nb - na)
        self.assertLess(abs(d - haversine_m(*a, *b)) / d, 0.002)

    def test_ue_axes(self):
        f = LocalFrame(41.02, 40.522)
        x, y, z = f.to_ue(41.03, 40.522, 12.0)  # kuzeye
        self.assertAlmostEqual(x, 0.0, places=6)
        self.assertLess(y, 0.0)  # kuzey = -Y
        self.assertEqual(z, 1200.0)
        x, y, _ = f.to_ue(41.02, 40.53)  # doğuya
        self.assertGreater(x, 0.0)

    def test_region_bbox_square(self):
        r = REGIONS["merkez"]
        s, w, n, e = r.bbox()
        f = LocalFrame.for_region(r)
        e0, n0 = f.to_en(s, w)
        e1, n1 = f.to_en(n, e)
        self.assertAlmostEqual(e1 - e0, r.size_m, delta=0.01)
        self.assertAlmostEqual(n1 - n0, r.size_m, delta=0.01)


class TestDem(unittest.TestCase):
    def test_terrarium_decode(self):
        # 0 m = (128, 0, 0); 100 m = 32868 = 128*256 + 100
        rgb = np.array([[[128, 0, 0], [128, 100, 0], [127, 255, 128]]], dtype=np.uint8)
        h = fetch_dem.decode_terrarium(rgb)
        np.testing.assert_allclose(h[0], [0.0, 100.0, -0.5])

    def test_landscape_params_map_extremes(self):
        r = REGIONS["merkez"]
        h = np.array([[-10.0, 0.0], [200.0, 440.0]])
        p = fetch_dem.landscape_params(h, r)
        sz, lz = p["landscape_scale"]["z"], p["landscape_location_cm"]["z"]
        world = lambda v: lz + (v - 32768) / 128.0 * sz  # noqa: E731  UE formülü
        self.assertAlmostEqual(world(0), -1000.0, delta=1.0)        # en düşük = -10 m
        self.assertAlmostEqual(world(65535), 44000.0, delta=1.0)    # en yüksek = 440 m
        enc = fetch_dem.encode_heightmap(h)
        self.assertEqual(enc.dtype, np.uint16)
        self.assertEqual(int(enc.min()), 0)
        self.assertEqual(int(enc.max()), 65535)

    def test_bilinear(self):
        img = np.array([[0.0, 10.0], [20.0, 30.0]])
        self.assertAlmostEqual(float(fetch_dem.bilinear(img, np.array([0.5]), np.array([0.5]))[0]), 15.0)

    def test_tile_math(self):
        x, y = lonlat_to_global_px(0.0, 0.0, 1)
        self.assertAlmostEqual(x, 256.0)
        self.assertAlmostEqual(y, 256.0)


class TestOsmConversion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        r = REGIONS["merkez"]
        # Yapay arazi: güneye doğru düzgün yükselen yamaç (kuzey kenarı 0 m, güney kenarı 280 m)
        n = 201
        north = np.linspace(r.size_m / 2, -r.size_m / 2, n)
        grid = np.tile(((r.size_m / 2 - north) / r.size_m * 280.0)[:, None], (1, n)).astype(np.float32)
        cls.tmp = tempfile.TemporaryDirectory()
        cls.hpath = os.path.join(cls.tmp.name, "h.npy")
        np.save(cls.hpath, grid)
        cls.L = osm_to_rize.convert(FIXTURE, r, cls.hpath)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_counts(self):
        s = self.L["stats"]
        self.assertEqual(s["roads"], 1)
        self.assertEqual(s["steps"], 1)
        self.assertEqual(s["buildings"], 1)
        self.assertEqual(s["handrails"], 2)            # merdivenin iki yanı
        self.assertEqual(s["curbs"], 2)                # mahalle yolu: iki yan bordür
        self.assertGreaterEqual(s["pois"], 2)          # bakkal + çay ocağı (bölge dışı atlandı)
        self.assertTrue(all(p["name"] != "" or p["kind"] for p in self.L["pois"]))

    def test_road_attributes(self):
        road = self.L["roads"][0]
        self.assertEqual(road["surface"], "ArnavutKaldirimi")
        self.assertEqual(road["speed_kmh"], 30)
        self.assertGreater(road["length_m"], 300)
        self.assertGreater(road["avg_grade"], 0.02)   # güneye çıkan yokuş
        # Z gerçekten araziden geliyor ve güneye doğru artıyor
        self.assertLess(road["points"][0][2], road["points"][-1][2])

    def test_building(self):
        b = self.L["buildings"][0]
        self.assertEqual(b["levels"], 5)
        self.assertAlmostEqual(b["height_m"], 16.0)
        self.assertEqual(len(b["footprint"]), 4)       # kapalı halkanın tekrar eden son noktası atıldı
        self.assertGreater(b["slope_drop_m"], 0.0)     # yamaçta

    def test_derived_lamps_respect_existing(self):
        lamps = self.L["street_lamps"]
        self.assertEqual(sum(1 for l in lamps if l["source"] == "osm"), 1)
        derived = [l for l in lamps if l["source"] == "derived"]
        self.assertGreaterEqual(len(derived), 8)       # ~330 m / 30 m
        osm = next(l for l in lamps if l["source"] == "osm")["pos"]
        for d in derived:                              # mevcut lambanın dibine ikinci lamba konmaz
            self.assertGreater(math.dist(d["pos"][:2], osm[:2]), 2000.0)

    def test_drains_on_slope(self):
        self.assertGreater(len(self.L["storm_drains"]), 10)

    def test_utility_wires_connect_poles(self):
        self.assertGreater(len(self.L["utility_poles"]), 5)
        self.assertEqual(len(self.L["overhead_wires"]), len(self.L["utility_poles"]) - 1)

    def test_axis_convention(self):
        road = self.L["roads"][0]
        # Yol kuzeyden güneye çiziliyor → UE Y artmalı (+Y = güney)
        self.assertLess(road["points"][0][1], road["points"][-1][1])

    def test_json_serializable(self):
        json.dumps(self.L, ensure_ascii=False)


class TestOffsets(unittest.TestCase):
    def test_offset_straight(self):
        pts = [(0.0, 0.0), (10.0, 0.0)]
        left = osm_to_rize.offset_polyline(pts, 2.0)
        self.assertEqual(left, [(0.0, 2.0), (10.0, 2.0)])

    def test_resample(self):
        s = osm_to_rize.resample([(0.0, 0.0), (100.0, 0.0)], 25.0)
        self.assertEqual([round(p[0]) for p in s], [0, 25, 50, 75, 100])


if __name__ == "__main__":
    unittest.main()
