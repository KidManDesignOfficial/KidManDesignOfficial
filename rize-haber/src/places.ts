/**
 * Hava durumu için seçilebilen tüm Rize konumları: 12 ilçe merkezi + Ayder ve
 * GeoNames açık verisinden gelen köy, belde ve yaylalar (`data/rizePlaces.ts`).
 *
 * Arama Türkçe harflere duyarsızdır ("cayeli" → Çayeli, "ikizdere" → İkizdere) ve köylerin
 * eski adlarını da tanır ("Elevit" → Yaylaköy, "Anzer" → Ballıköy). Tamamen çevrimdışı çalışır.
 */
import { WEATHER_LOCATIONS, type WeatherLocation } from './config.ts';
import { RIZE_PLACE_ROWS, type PlaceKind as RowKind } from './data/rizePlaces.ts';

export type PlaceKind = 'ilce' | RowKind;

export type Place = WeatherLocation & {
  kind: PlaceKind;
  /** İlçe kimliği (WEATHER_LOCATIONS'taki ilçe merkezinin `id`'si). */
  district: string;
  /** Metre; bilinmiyorsa null. */
  elevation: number | null;
  /** Eski veya diğer adlar (yalnızca aramada kullanılır). */
  aka: readonly string[];
};

/** Ayder bir yayla olsa da ilçe merkezleriyle birlikte üst listede durur. */
const DISTRICT_OF_SPECIAL: Record<string, string> = { ayder: 'camlihemsin' };

export const DISTRICT_PLACES: Place[] = WEATHER_LOCATIONS.map((l) => ({
  ...l,
  kind: DISTRICT_OF_SPECIAL[l.id] ? 'yayla' : 'ilce',
  district: DISTRICT_OF_SPECIAL[l.id] ?? l.id,
  elevation: null,
  aka: [],
}));

/** Yalnızca 12 ilçe (Ayder hariç), listede görünen sırayla. */
export const DISTRICTS: Place[] = DISTRICT_PLACES.filter((p) => p.kind === 'ilce');

/** "Ayder Yaylası" → "ayder": aynı yerin farklı kayıtlarını eşlemek için. */
function baseName(name: string): string {
  return normalizeTr(name.replace(/\s+(yaylası|köyü)$/i, ''));
}

/** İki nokta arası yaklaşık km (Rize enleminde yeterince doğru). */
function distanceKm(a: WeatherLocation, b: WeatherLocation): number {
  return Math.hypot((a.latitude - b.latitude) * 111, (a.longitude - b.longitude) * 84);
}

/** Elle tanımlı konumlarla (ör. Ayder Yaylası) aynı yeri gösteren GeoNames kayıtları listeye tekrar girmez. */
function duplicatesCurated(p: WeatherLocation): boolean {
  return DISTRICT_PLACES.some((d) => baseName(d.name) === baseName(p.name) && distanceKm(d, p) < 3);
}

const VILLAGES: Place[] = RIZE_PLACE_ROWS.map(([id, name, district, kind, latitude, longitude, elevation, aka]) => ({
  id,
  name,
  latitude,
  longitude,
  kind,
  district,
  elevation: elevation > 0 ? elevation : null,
  aka,
})).filter((p) => !duplicatesCurated(p));

export const ALL_PLACES: Place[] = [...DISTRICT_PLACES, ...VILLAGES];

const BY_ID = new Map(ALL_PLACES.map((p) => [p.id, p]));

export function placeById(id: string): Place | undefined {
  return BY_ID.get(id);
}

/** İlçenin kısa adı: "Rize Merkez" → "Merkez". */
export function districtName(districtId: string): string {
  const d = BY_ID.get(districtId);
  if (!d) return '';
  return d.id === 'merkez' ? 'Merkez' : d.name;
}

const KIND_LABEL: Record<PlaceKind, string> = { ilce: 'İlçe merkezi', belde: 'Belde', koy: 'Köy', yayla: 'Yayla' };

export function kindLabel(kind: PlaceKind): string {
  return KIND_LABEL[kind];
}

/** Liste satırının alt yazısı: "Çamlıhemşin · Yayla · 2.123 m". */
export function placeSubtitle(place: Place): string {
  if (place.kind === 'ilce') return KIND_LABEL.ilce;
  const parts = [districtName(place.district), KIND_LABEL[place.kind]];
  if (place.elevation != null) parts.push(`${place.elevation.toLocaleString('tr-TR')} m`);
  return parts.join(' · ');
}

/** Türkçe harfleri sadeleştirir, küçültür; boşluk ve noktalama atılır. */
export function normalizeTr(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' })[c] ?? c)
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '');
}

type Indexed = { place: Place; name: string; words: string[]; aka: string[]; district: string };

const INDEX: Indexed[] = ALL_PLACES.map((place) => ({
  place,
  name: normalizeTr(place.name),
  words: place.name.split(/[\s-]+/).map(normalizeTr).filter(Boolean),
  aka: place.aka.map(normalizeTr),
  district: normalizeTr(districtName(place.district)),
}));

const KIND_ORDER: Record<PlaceKind, number> = { ilce: 0, belde: 1, koy: 2, yayla: 3 };

export type SearchHit = { place: Place; /** Eşleşen eski ad (ad yerine bununla bulunduysa). */ matchedAka?: string };

/**
 * Ada, eski adlara ve ilçe adına göre arar. Sıralama: tam eşleşme, baştan eşleşme,
 * kelime başı, içinde geçme, eski ad, son olarak ilçesi eşleşenler.
 */
export function searchPlaces(query: string, limit = 60): SearchHit[] {
  const q = normalizeTr(query);
  if (!q) return [];
  const hits: { hit: SearchHit; score: number }[] = [];
  for (const it of INDEX) {
    let score = -1;
    let matchedAka: string | undefined;
    if (it.name === q) score = 0;
    else if (it.name.startsWith(q)) score = 1;
    else if (it.words.some((w) => w.startsWith(q))) score = 2;
    else if (q.length >= 3 && it.name.includes(q)) score = 3;
    else {
      const i = it.aka.findIndex((a) => a.startsWith(q) || (q.length >= 3 && a.includes(q)));
      if (i >= 0) {
        score = 4;
        matchedAka = it.place.aka[i];
      } else if (it.district.startsWith(q)) score = 5;
    }
    if (score >= 0) hits.push({ hit: { place: it.place, matchedAka }, score });
  }
  hits.sort(
    (a, b) =>
      a.score - b.score ||
      KIND_ORDER[a.hit.place.kind] - KIND_ORDER[b.hit.place.kind] ||
      a.hit.place.name.localeCompare(b.hit.place.name, 'tr'),
  );
  return hits.slice(0, limit).map((h) => h.hit);
}

/** İlçeye bağlı köy, belde ve yaylalar (ilçe merkezi hariç), türe ve ada göre sıralı. */
export function placesInDistrict(districtId: string): Place[] {
  return VILLAGES.filter((p) => p.district === districtId).sort(
    (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name, 'tr'),
  );
}

/** İlçedeki köy/belde/yayla sayısı (Ayder Çamlıhemşin'e dahildir). */
export function districtPlaceCount(districtId: string): number {
  return VILLAGES.reduce((n, p) => (p.district === districtId ? n + 1 : n), 0);
}

/** Son seçilen yerler listesine ekler: en yeni başta, tekrarsız, en çok `max` kayıt. */
export function pushRecent(list: readonly string[], id: string, max = 6): string[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, max);
}
