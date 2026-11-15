"""Yerleşim içe aktarımının motordan bağımsız geometri çekirdeği (testlenebilir).

Unreal editörü içindeki rize_import_layout.py bunu kullanır; burada `unreal`
modülü yoktur, böylece CI'da doğrulanabilir.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

# Yol tipi → sürülebilir mi (yapay zeka trafiği / dolmuş için ARizeRoadPath üretilir)
DRIVABLE = {"primary", "secondary", "tertiary", "residential", "unclassified", "living_street",
            "service", "trunk", "primary_link", "secondary_link", "tertiary_link"}


@dataclass
class OrientedBox:
    cx: float
    cy: float
    length: float  # yerel X boyunca
    width: float   # yerel Y boyunca
    yaw_deg: float


def convex_hull(pts: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Andrew monotone zinciri."""
    p = sorted(set(pts))
    if len(p) <= 2:
        return p

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for q in p:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], q) <= 0:
            lower.pop()
        lower.append(q)
    for q in reversed(p):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], q) <= 0:
            upper.pop()
        upper.append(q)
    return lower[:-1] + upper[:-1]


def min_area_rect(pts: list[tuple[float, float]]) -> OrientedBox:
    """En küçük alanlı yönlü dikdörtgen (dönen kumpas; kenar yönleri denenir).

    Bina taban izi poligon olarak çıkarılamadığında yer tutucu kutu için kullanılır.
    """
    hull = convex_hull(pts)
    if len(hull) < 3:
        xs, ys = [q[0] for q in pts], [q[1] for q in pts]
        return OrientedBox((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, max(1.0, max(xs) - min(xs)), max(1.0, max(ys) - min(ys)), 0.0)
    best = None
    for i in range(len(hull)):
        x0, y0 = hull[i]
        x1, y1 = hull[(i + 1) % len(hull)]
        ang = math.atan2(y1 - y0, x1 - x0)
        c, s = math.cos(-ang), math.sin(-ang)
        rx = [q[0] * c - q[1] * s for q in hull]
        ry = [q[0] * s + q[1] * c for q in hull]
        w, h = max(rx) - min(rx), max(ry) - min(ry)
        area = w * h
        if best is None or area < best[0]:
            mx, my = (max(rx) + min(rx)) / 2, (max(ry) + min(ry)) / 2
            # merkezi geri döndür
            cb, sb = math.cos(ang), math.sin(ang)
            best = (area, OrientedBox(mx * cb - my * sb, mx * sb + my * cb, w, h, math.degrees(ang)))
    return best[1]


def polygon_area(pts: list[tuple[float, float]]) -> float:
    return 0.5 * abs(sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))))


def path_id_for_road(road: dict, index: int) -> str:
    """ARizeRoadPath kimliği: dolmus_lines.json'daki pathId'lerle elle eşleştirilir."""
    return f"osm_{road.get('osm_id', index)}"


def simplify(points: list[list[float]], tolerance_cm: float = 50.0) -> list[list[float]]:
    """Ramer–Douglas–Peucker (2B). Spline'da gereksiz nokta = gereksiz maliyet."""
    if len(points) < 3:
        return points

    def perp(p, a, b):
        ax, ay, bx, by = a[0], a[1], b[0], b[1]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        if L < 1e-9:
            return math.hypot(p[0] - ax, p[1] - ay)
        return abs(dy * p[0] - dx * p[1] + bx * ay - by * ax) / L

    dmax, idx = 0.0, 0
    for i in range(1, len(points) - 1):
        d = perp(points[i], points[0], points[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > tolerance_cm:
        left = simplify(points[: idx + 1], tolerance_cm)
        right = simplify(points[idx:], tolerance_cm)
        return left[:-1] + right
    return [points[0], points[-1]]


def chunk_folder(kind: str, x_cm: float, y_cm: float, cell_m: float = 500.0) -> str:
    """Outliner'ı 500 m'lik hücrelere böl: 'Altyapi/Lambalar/H_+2_-1'. World Partition ile uyumlu."""
    cx, cy = int(math.floor(x_cm / 100.0 / cell_m)), int(math.floor(y_cm / 100.0 / cell_m))
    return f"Rize/{kind}/H_{cx:+d}_{cy:+d}"
