import math
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ue_python"))
import rize_layout_core as core  # noqa: E402


class TestLayoutCore(unittest.TestCase):
    def test_min_area_rect_rotated(self):
        # 20 x 10 dikdörtgen, 30° döndürülmüş
        a = math.radians(30)
        base = [(-10, -5), (10, -5), (10, 5), (-10, 5)]
        pts = [(x * math.cos(a) - y * math.sin(a) + 100, x * math.sin(a) + y * math.cos(a) + 50) for x, y in base]
        b = core.min_area_rect(pts)
        self.assertAlmostEqual(b.length * b.width, 200.0, places=6)
        self.assertAlmostEqual(b.cx, 100.0, places=6)
        self.assertAlmostEqual(b.cy, 50.0, places=6)
        self.assertAlmostEqual(sorted([b.length, b.width])[1], 20.0, places=6)

    def test_area(self):
        self.assertAlmostEqual(core.polygon_area([(0, 0), (4, 0), (4, 3), (0, 3)]), 12.0)

    def test_simplify_keeps_corner(self):
        pts = [[0, 0, 0], [500, 1, 0], [1000, 0, 0], [1000, 1000, 0]]
        s = core.simplify(pts, 50.0)
        self.assertEqual(s, [[0, 0, 0], [1000, 0, 0], [1000, 1000, 0]])

    def test_chunk_folder(self):
        self.assertEqual(core.chunk_folder("Lambalar", 120000, -60000), "Rize/Lambalar/H_+2_-2")


if __name__ == "__main__":
    unittest.main()
