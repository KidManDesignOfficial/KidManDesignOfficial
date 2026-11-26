#!/usr/bin/env python3
"""
Ana ekran widget'ları ve uygulama kısayolları için Android vektör simgelerini üretir.

Simgeler uygulamanın kendi simge yazı tipinden (Ionicons, MIT lisanslı) alınır; böylece widget'taki
simgeler uygulamadakilerle birebir aynıdır. Çıktı:
  modules/rize-widgets/android/src/main/res/drawable/rw_ic_*.xml  (24dp, beyaz; widget'ta renklendirilir)
  modules/rize-widgets/android/src/main/res/drawable/rw_sc_*.xml  (48dp, renkli daire + beyaz simge; kısayollar)

Çalıştırma (rize-haber/ klasöründe):  pip install fonttools && python3 scripts/widget-icons.py
"""
import json
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENDOR = os.path.join(ROOT, 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons')
OUT = os.path.join(ROOT, 'modules/rize-widgets/android/src/main/res/drawable')

# Widget simgeleri: dosya adı → Ionicons adı.
WIDGET_ICONS = {
    'news': 'newspaper',
    'football': 'football',
    'tea': 'leaf',
    'economy': 'trending-up',
    'weather': 'partly-sunny',
    'sunny': 'sunny',
    'moon': 'moon',
    'partly': 'partly-sunny',
    'partly_night': 'cloudy-night',
    'cloudy': 'cloudy',
    'rain': 'rainy',
    'snow': 'snow',
    'storm': 'thunderstorm',
    'location': 'location',
}
# Kısayol simgeleri: dosya adı → (Ionicons adı, daire rengi). Renkler uygulamanın sekme renkleridir.
SHORTCUT_ICONS = {
    'news': ('newspaper', '#1B6B3A'),
    'rizespor': ('football', '#0A8A43'),
    'tea': ('leaf', '#2E7D32'),
    'economy': ('trending-up', '#8A6D1F'),
    'weather': ('partly-sunny', '#0B5C7A'),
}

# Ionicons glifleri 512 birimlik karede, taban çizgisi y=0 ve üst sınır y=448'dir (y yukarı doğru artar).
EM = 512
TOP = 448


def glyph_path(font, glyph_map, name):
    cmap = font.getBestCmap()
    glyph_name = cmap[glyph_map[name]]
    glyph_set = font.getGlyphSet()
    pen = SVGPathPen(glyph_set, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    # Android vektörlerinde y aşağı doğru artar: ters çevir ve kareye yerleştir.
    glyph_set[glyph_name].draw(TransformPen(pen, (1, 0, 0, -1, 0, TOP)))
    return pen.getCommands()


HEADER = '<?xml version="1.0" encoding="utf-8"?>\n<!-- scripts/widget-icons.py ile üretildi; elle düzenlemeyin. Ionicons (MIT). -->\n'


def main():
    font = TTFont(os.path.join(VENDOR, 'Fonts/Ionicons.ttf'))
    with open(os.path.join(VENDOR, 'glyphmaps/Ionicons.json')) as f:
        glyph_map = json.load(f)
    os.makedirs(OUT, exist_ok=True)

    for file_name, icon in WIDGET_ICONS.items():
        path = glyph_path(font, glyph_map, icon)
        with open(os.path.join(OUT, f'rw_ic_{file_name}.xml'), 'w') as f:
            f.write(
                HEADER
                + '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n'
                + '    android:width="24dp" android:height="24dp"\n'
                + f'    android:viewportWidth="{EM}" android:viewportHeight="{EM}">\n'
                + f'  <path android:fillColor="#FFFFFFFF" android:pathData="{path}" />\n'
                + '</vector>\n'
            )

    for file_name, (icon, color) in SHORTCUT_ICONS.items():
        path = glyph_path(font, glyph_map, icon)
        # 48dp daire; simge ortada, dairenin yarısı boyutunda (Android kısayol simgesi yönergesi).
        with open(os.path.join(OUT, f'rw_sc_{file_name}.xml'), 'w') as f:
            f.write(
                HEADER
                + '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n'
                + '    android:width="48dp" android:height="48dp"\n'
                + '    android:viewportWidth="48" android:viewportHeight="48">\n'
                + f'  <path android:fillColor="{color}" android:pathData="M24,0A24,24 0,1 1,24,48A24,24 0,1 1,24,0Z" />\n'
                + f'  <group android:translateX="13" android:translateY="13" android:scaleX="{22 / EM:.6f}" android:scaleY="{22 / EM:.6f}">\n'
                + f'    <path android:fillColor="#FFFFFFFF" android:pathData="{path}" />\n'
                + '  </group>\n'
                + '</vector>\n'
            )
    print(f'{len(WIDGET_ICONS)} widget simgesi ve {len(SHORTCUT_ICONS)} kısayol simgesi yazıldı → {OUT}')


if __name__ == '__main__':
    main()
