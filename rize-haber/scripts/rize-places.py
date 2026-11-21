#!/usr/bin/env python3
"""
Rize'nin köy, belde ve yaylalarını GeoNames açık verisinden (CC BY 4.0) üretir.

Kullanım:
  curl -O https://download.geonames.org/export/dump/TR.zip && unzip TR.zip
  python3 scripts/rize-places.py TR.txt > src/data/rizePlaces.ts

Rize'nin GeoNames il kodu 53'tür. İlçe merkezleri (PPLA/PPLA2) uygulamada zaten ayrı
tanımlı olduğu için alınmaz. İlçesi boş kalan birkaç kayıt, en yakın 5 komşusunun çoğunluk
ilçesine atanır.
"""
import csv
import json
import re
import sys
import unicodedata

DISTRICTS = {
    '13308777': 'merkez', '9549101': 'ardesen', '8631454': 'camlihemsin', '9549145': 'cayeli',
    '8631455': 'derepazari', '9549311': 'findikli', '8631451': 'guneysu', '8631452': 'hemsin',
    '8631450': 'ikizdere', '9549009': 'iyidere', '7911029': 'kalkandere', '8631453': 'pazar',
}
KIND = {'PPL': 'koy', 'PPLX': 'koy', 'PPLA3': 'belde', 'CMP': 'yayla', 'UPLD': 'yayla'}
LETTERS = re.compile(r"^[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû .-]+$")


def norm(s: str) -> str:
    s = s.replace('İ', 'i').replace('I', 'ı').lower()
    s = s.translate(str.maketrans('çğıöşüâîû', 'cgiosuaiu'))
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if c.isalnum())
    return re.sub(r'(koyu|koy|mahallesi|yaylasi|yayla)$', '', s)


def main(path: str) -> None:
    rows = []
    for r in csv.reader(open(path, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
        if r[10] != '53' or r[7] not in KIND:
            continue
        elev = int(r[15] or r[16] or 0)
        main_key = norm(r[1])
        aka, seen = [], {main_key}
        for alt in r[3].split(','):
            alt = alt.strip()
            key = norm(alt)
            if not alt or not LETTERS.match(alt) or len(alt) > 24 or key in seen or len(key) < 3:
                continue
            seen.add(key)
            # Türkçe harfli yazımı ASCII olanına tercih et (sıra: GeoNames alfabetik verir).
            aka.append(alt)
        # ASCII tekrarlarını ele: aynı anahtarlı ikinci yazım zaten atlandı; ilk 3'ü yeter.
        rows.append({
            'id': 'g' + r[0], 'name': r[1], 'kind': KIND[r[7]], 'lat': round(float(r[4]), 4),
            'lon': round(float(r[5]), 4), 'd': DISTRICTS.get(r[11]), 'elev': max(elev, 0), 'aka': aka[:3],
        })
    known = [x for x in rows if x['d']]
    for x in rows:
        if x['d']:
            continue
        near = sorted(known, key=lambda k: (k['lat'] - x['lat']) ** 2 + (k['lon'] - x['lon']) ** 2)[:5]
        votes = {}
        for k in near:
            votes[k['d']] = votes.get(k['d'], 0) + 1
        x['d'] = max(votes, key=votes.get)
    # Aynı ilçede aynı adla 1,5 km'den yakın iki kayıt aynı yerdir: biri yeter.
    out = []
    for x in sorted(rows, key=lambda x: (x['d'], x['name'], x['id'])):
        dup = any(
            y['d'] == x['d'] and y['name'] == x['name']
            and ((y['lat'] - x['lat']) * 111) ** 2 + ((y['lon'] - x['lon']) * 84) ** 2 < 1.5 ** 2
            for y in out
        )
        if not dup:
            out.append(x)

    print('/**')
    print(' * Rize\'nin köy, belde ve yaylaları — GeoNames açık verisi (CC BY 4.0, geonames.org).')
    print(' * Bu dosya `scripts/rize-places.py` ile üretilir; elle düzenlemeyin.')
    print(' * Alanlar: [kimlik, ad, ilçe, tür, enlem, boylam, rakım (m), eski/diğer adlar]')
    print(' */')
    print("export type PlaceKind = 'koy' | 'belde' | 'yayla';")
    print('export type PlaceRow = readonly [string, string, string, PlaceKind, number, number, number, readonly string[]];')
    print()
    print('export const RIZE_PLACE_ROWS: readonly PlaceRow[] = [')
    for x in out:
        row = [x['id'], x['name'], x['d'], x['kind'], x['lat'], x['lon'], x['elev'], x['aka']]
        print('  ' + json.dumps(row, ensure_ascii=False) + ',')
    print('];')


if __name__ == '__main__':
    main(sys.argv[1])
