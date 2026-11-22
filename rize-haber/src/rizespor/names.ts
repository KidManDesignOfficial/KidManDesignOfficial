/**
 * Veri kaynağından İngilizce/aksansız gelen adların Türkçe karşılıkları.
 * Takım listesi 2026-27 Süper Lig takımlarına göre hazırlanmıştır; yalnızca aksan düzeltmesi yapılır.
 * Bilinmeyen bir ad gelirse olduğu gibi gösterilir; uygulama hiçbir zaman boş metin göstermez.
 */

export const RIZESPOR_ID = '7656';

/** Kulüp renkleri: yeşil-mavi. */
export const CLUB_COLORS = { green: '#0A8A43', blue: '#0B4EA2', greenDark: '#065A2C', blueDark: '#062F66' } as const;

const TEAM_NAMES: Record<string, string> = {
  'Caykur Rizespor': 'Çaykur Rizespor',
  Besiktas: 'Beşiktaş',
  Fenerbahce: 'Fenerbahçe',
  'Istanbul Basaksehir': 'Başakşehir',
  Goztepe: 'Göztepe',
  Genclerbirligi: 'Gençlerbirliği',
  Eyupspor: 'Eyüpspor',
  Kasimpasa: 'Kasımpaşa',
};

export function teamName(raw: string | undefined | null): string {
  if (!raw) return '–';
  return TEAM_NAMES[raw] ?? raw;
}

/** Takım adının kısa biçimi (dar satırlar için). */
export function shortTeamName(name: string): string {
  return name.replace(/^Çaykur\s+/, '').replace(/\s+(FK|SK|SFK|JK|AŞ)$/, '');
}

const VENUE_NAMES: Record<string, string> = {
  'Estadio Caykur Didi': 'Çaykur Didi Stadyumu',
  'Diyarbakir Stadyumu': 'Diyarbakır Stadyumu',
};

export function venueName(raw: string | undefined | null): string | null {
  if (!raw) return null;
  return VENUE_NAMES[raw] ?? raw.replace(/^Estadio\s+(.+)$/, '$1 Stadyumu');
}

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

export const POSITION_GROUPS: { id: PositionGroup; label: string }[] = [
  { id: 'GK', label: 'Kaleciler' },
  { id: 'DEF', label: 'Defans' },
  { id: 'MID', label: 'Orta saha' },
  { id: 'FWD', label: 'Forvet' },
];

export function positionGroup(name: string | undefined | null): PositionGroup {
  const n = (name ?? '').toLowerCase();
  if (n.includes('goal')) return 'GK';
  if (n.includes('defen') || n.includes('back') || n.includes('sweeper')) return 'DEF';
  if (n.includes('forward') || n.includes('striker') || n.includes('wing')) return 'FWD';
  return 'MID';
}

export type StatGroup = 'attack' | 'passing' | 'defence' | 'discipline';

export const STAT_GROUPS: { id: StatGroup; label: string }[] = [
  { id: 'attack', label: 'Hücum' },
  { id: 'passing', label: 'Pas' },
  { id: 'defence', label: 'Savunma' },
  { id: 'discipline', label: 'Disiplin' },
];

export const STAT_LABELS: { key: string; label: string; group: StatGroup; percent?: boolean }[] = [
  { key: 'possessionPct', label: 'Topla oynama', group: 'attack', percent: true },
  { key: 'totalShots', label: 'Şut', group: 'attack' },
  { key: 'shotsOnTarget', label: 'İsabetli şut', group: 'attack' },
  { key: 'blockedShots', label: 'Engellenen şut', group: 'attack' },
  { key: 'wonCorners', label: 'Korner', group: 'attack' },
  { key: 'offsides', label: 'Ofsayt', group: 'attack' },
  { key: 'totalPasses', label: 'Pas', group: 'passing' },
  { key: 'accuratePasses', label: 'İsabetli pas', group: 'passing' },
  { key: 'passPct', label: 'Pas isabeti', group: 'passing', percent: true },
  { key: 'totalTackles', label: 'Müdahale', group: 'defence' },
  { key: 'effectiveTackles', label: 'Başarılı müdahale', group: 'defence' },
  { key: 'totalClearance', label: 'Uzaklaştırma', group: 'defence' },
  { key: 'saves', label: 'Kurtarış', group: 'defence' },
  { key: 'foulsCommitted', label: 'Faul', group: 'discipline' },
  { key: 'yellowCards', label: 'Sarı kart', group: 'discipline' },
  { key: 'redCards', label: 'Kırmızı kart', group: 'discipline' },
];

/** ISO-3166 alpha-3 → alpha-2 (bayrak emojisi için); kadrodaki yaygın ülkeler. */
const ALPHA3_TO_2: Record<string, string> = {
  TUR: 'TR', CIV: 'CI', GAM: 'GM', GMB: 'GM', NGA: 'NG', GHA: 'GH', SEN: 'SN', CMR: 'CM', MLI: 'ML',
  ALB: 'AL', BIH: 'BA', SRB: 'RS', CRO: 'HR', HRV: 'HR', SVN: 'SI', MKD: 'MK', MNE: 'ME', KOS: 'XK',
  HUN: 'HU', ROU: 'RO', POL: 'PL', CZE: 'CZ', SVK: 'SK', UKR: 'UA', RUS: 'RU', GEO: 'GE', AZE: 'AZ',
  GER: 'DE', DEU: 'DE', NED: 'NL', NLD: 'NL', BEL: 'BE', FRA: 'FR', ESP: 'ES', POR: 'PT', PRT: 'PT',
  ITA: 'IT', ENG: 'GB', SCO: 'GB', WAL: 'GB', IRL: 'IE', SUI: 'CH', CHE: 'CH', AUT: 'AT', DEN: 'DK',
  DNK: 'DK', SWE: 'SE', NOR: 'NO', FIN: 'FI', ISL: 'IS', GRE: 'GR', GRC: 'GR', CYP: 'CY', BUL: 'BG',
  BGR: 'BG', MAR: 'MA', ALG: 'DZ', DZA: 'DZ', TUN: 'TN', EGY: 'EG', COD: 'CD', CGO: 'CG', GAB: 'GA',
  GUI: 'GN', GIN: 'GN', BFA: 'BF', TOG: 'TG', BEN: 'BJ', ANG: 'AO', AGO: 'AO', CPV: 'CV', RSA: 'ZA',
  ZAF: 'ZA', BRA: 'BR', ARG: 'AR', URU: 'UY', URY: 'UY', COL: 'CO', CHI: 'CL', CHL: 'CL', PAR: 'PY',
  PRY: 'PY', VEN: 'VE', ECU: 'EC', PER: 'PE', USA: 'US', CAN: 'CA', MEX: 'MX', JPN: 'JP', KOR: 'KR',
  IRN: 'IR', ISR: 'IL', UZB: 'UZ', KAZ: 'KZ', TJK: 'TJ', KGZ: 'KG', TKM: 'TM', MDA: 'MD', LVA: 'LV', LTU: 'LT', EST: 'EE', BLR: 'BY', LUX: 'LU', NIR: 'GB', ZIM: 'ZW', ZAM: 'ZM', KEN: 'KE', UGA: 'UG', TAN: 'TZ', ETH: 'ET', SLE: 'SL', LBR: 'LR', GNB: 'GW', MTN: 'MR', NIG: 'NE', SDN: 'SD', LBY: 'LY', IRQ: 'IQ', SYR: 'SY', JOR: 'JO', KSA: 'SA', QAT: 'QA', UAE: 'AE', CHN: 'CN', PAN: 'PA', CRC: 'CR', HON: 'HN', NZL: 'NZ', SUR: 'SR', CUW: 'CW', HAI: 'HT', HTI: 'HT', JAM: 'JM', AUS: 'AU', ARM: 'AM',
};

/** "CIV" → 🇨🇮 ; bilinmiyorsa null. */
export function flagEmoji(alpha3: string | undefined | null): string | null {
  const a2 = alpha3 ? ALPHA3_TO_2[alpha3.toUpperCase()] : undefined;
  if (!a2 || a2 === 'XK') return null;
  return String.fromCodePoint(...[...a2].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Puan tablosu bölge açıklamaları. */
export function zoneLabel(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const n = raw.toLowerCase();
  if (n.includes('champions')) return 'Şampiyonlar Ligi';
  if (n.includes('europa league')) return 'Avrupa Ligi';
  if (n.includes('conference')) return 'Konferans Ligi';
  if (n.includes('relegation')) return 'Küme düşme';
  return raw;
}
