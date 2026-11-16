/**
 * Açık kaynak konu anlatımı: Türkçe Vikipedi (CC BY-SA 4.0).
 *
 * Maddenin güncel kaynak metni (wikitext) canlı indirilir ve okunur bölümlere çevrilir:
 * şablonlar, tablolar, görseller, dipnotlar ve kaynakça çıkarılır; LaTeX formüller okunur
 * metne (x², √x, a/b, ≤, π …) dönüştürülür. Lisans gereği madde adı, yazarlar (madde geçmişi),
 * lisans ve "biçim sadeleştirildi" notu ekranda gösterilir.
 *
 * Saf fonksiyonlar; test/wiki.test.ts gerçek madde kopyalarıyla doğrular.
 */

export type WikiBlock = { t: 'p' | 'li' | 'math'; text: string };
export type WikiSection = { title: string; level: number; blocks: WikiBlock[] };
export type WikiArticle = { title: string; sections: WikiSection[]; chars: number };

export const WIKI_HOST = 'https://tr.wikipedia.org';
export const WIKI_LICENSE = { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr' };
const enc = (title: string) => encodeURIComponent(title.replace(/ /g, '_'));
export const wikiRawUrl = (title: string) => `${WIKI_HOST}/w/index.php?title=${enc(title)}&action=raw`;
/** CORS destekli API (web önizlemesi için); yönlendirmeleri kendisi çözer. */
export const wikiApiUrl = (title: string) =>
  `${WIKI_HOST}/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2&origin=*&titles=${encodeURIComponent(title)}`;
export const wikiPageUrl = (title: string) => `${WIKI_HOST}/wiki/${enc(title)}`;
export const wikiHistoryUrl = (title: string) => `${WIKI_HOST}/w/index.php?title=${enc(title)}&action=history`;

/** Okumaya katkısı olmayan bölümler. */
const SKIP_SECTIONS = /^(kaynak(ça|lar)?|notlar|dipnotlar|açıklamalar|dış bağlantılar|ayrıca bakınız|ayrıca bakın|konuyla ilgili yayınlar|bibliyografya|ileri okuma(lar)?|galeri|dış kaynaklar|okuma listesi|ek okumalar|referanslar)$/i;

export function redirectTarget(wikitext: string): string | null {
  const m = wikitext.match(/^\s*#(?:YÖNLENDİRME|YÖNLENDİR|REDIRECT)\s*\[\[([^\]|#]+)/i);
  return m ? m[1].trim() : null;
}

// ---------------------------------------------------------------- LaTeX → okunur metin

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ', y: 'ʸ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', k: 'ᵏ', m: 'ᵐ', t: 'ᵗ' };
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', i: 'ᵢ', k: 'ₖ', n: 'ₙ', o: 'ₒ', r: 'ᵣ', t: 'ₜ', x: 'ₓ', m: 'ₘ', p: 'ₚ', s: 'ₛ' };

const SYMBOLS: Record<string, string> = {
  cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', equiv: '≡', sim: '~', propto: '∝',
  infty: '∞', to: '→', rightarrow: '→', Rightarrow: '⇒', leftarrow: '←', Leftarrow: '⇐', leftrightarrow: '↔', Leftrightarrow: '⇔', iff: '⇔', implies: '⇒', mapsto: '↦',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  int: '∫', iint: '∬', oint: '∮', sum: 'Σ', prod: 'Π', partial: '∂', nabla: '∇', in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅',
  forall: '∀', exists: '∃', neg: '¬', lnot: '¬', land: '∧', wedge: '∧', lor: '∨', vee: '∨', oplus: '⊕', degree: '°', circ: '°', angle: '∠', perp: '⊥', parallel: '∥', triangle: '△',
  ldots: '…', cdots: '⋯', dots: '…', vdots: '⋮', prime: '′', star: '*', ast: '*', mid: '|', vert: '|', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', langle: '⟨', rangle: '⟩', hbar: 'ħ', ell: 'ℓ',
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc', arcsin: 'arcsin', arccos: 'arccos', arctan: 'arctan', log: 'log', ln: 'ln', exp: 'exp', lim: 'lim', max: 'max', min: 'min', det: 'det', mod: 'mod', gcd: 'ebob',
  N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ',
};

/** {…} grubunu oku: s[i] === '{' olmalı; [içerik, sonraki indis] döner. */
function group(s: string, i: number): [string, number] {
  if (s[i] !== '{') {
    // tek karakter ya da tek komut argümanı
    if (s[i] === '\\') {
      const m = s.slice(i).match(/^\\[a-zA-Z]+/);
      if (m) return [m[0], i + m[0].length];
    }
    return [s[i] ?? '', i + 1];
  }
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') {
      depth--;
      if (depth === 0) return [s.slice(i + 1, j), j + 1];
    }
  }
  return [s.slice(i + 1), s.length];
}

const simple = (x: string) => /^[\w.′²³√π]+$/u.test(x);
const wrap = (x: string) => (simple(x) ? x : `(${x})`);

function script(x: string, map: Record<string, string>, mark: string): string {
  const chars = [...x];
  if (chars.length && chars.every((ch) => map[ch])) return chars.map((ch) => map[ch]).join('');
  return `${mark}${wrap(x)}`;
}

export function latexToText(src: string): string {
  let s = src
    .replace(/\\(displaystyle|textstyle|scriptstyle|left|right|big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr|limits|nolimits)\b/g, '')
    .replace(/\\(,|;|:|!|quad|qquad|\s)/g, ' ')
    .replace(/\\\\/g, '; ')
    .replace(/&/g, ' ')
    .replace(/\\begin\{[a-z*]+\}(\{[^}]*\})?|\\end\{[a-z*]+\}/g, ' ');
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') {
      const m = s.slice(i).match(/^\\([a-zA-Z]+)/);
      if (!m) {
        // \{ \} \% \_ gibi kaçışlar
        out += s[i + 1] ?? '';
        i += 2;
        continue;
      }
      const cmd = m[1];
      i += m[0].length;
      while (s[i] === ' ') i++;
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const [a, j0] = group(s, i);
        let j = j0;
        while (s[j] === ' ') j++;
        const [b, k] = group(s, j);
        const num = latexToText(a);
        const den = latexToText(b);
        out += `${wrap(num)}/${/^(\d+|[a-zA-Zα-ω]|[dδ∂][a-zA-Zα-ω])$/.test(den) ? den : `(${den})`}`;
        i = k;
      } else if (cmd === 'sqrt') {
        let n = '';
        if (s[i] === '[') {
          const e = s.indexOf(']', i);
          n = latexToText(s.slice(i + 1, e));
          i = e + 1;
        }
        const [a, j] = group(s, i);
        const inner = latexToText(a);
        out += `${n ? script(n, SUP, '^') : ''}√${simple(inner) ? inner : `(${inner})`}`;
        i = j;
      } else if (/^(text|mathrm|mathbf|mathit|mathsf|mathtt|operatorname|textrm|textbf|textit|mbox|boldsymbol|vec|overline|hat|bar|tilde|dot|ddot|overrightarrow|mathcal|mathbb|underline)$/.test(cmd)) {
        const [a, j] = group(s, i);
        const inner = /^(text|textrm|textbf|textit|mbox)$/.test(cmd) ? a : latexToText(a);
        out += cmd === 'mathbb' ? (SYMBOLS[inner] ?? inner) : cmd === 'vec' || cmd === 'overrightarrow' ? `${inner}⃗` : cmd === 'overline' || cmd === 'bar' ? `${inner}̅` : inner;
        i = j;
      } else if (cmd === 'binom' || cmd === 'tbinom' || cmd === 'dbinom') {
        const [a, j] = group(s, i);
        const [b, k] = group(s, j);
        out += `C(${latexToText(a)}, ${latexToText(b)})`;
        i = k;
      } else if (SYMBOLS[cmd] !== undefined) {
        const sym = SYMBOLS[cmd];
        out += /^[a-z]{2,}$/.test(sym) ? `${sym} ` : sym;
      }
      // bilinmeyen komut: atlanır
      continue;
    }
    if (ch === '^' || ch === '_') {
      const [a, j] = group(s, i + 1);
      const inner = latexToText(a).trim();
      if (ch === '_' && /lim\s*$/.test(out)) out = `${out.trimEnd()}(${inner}) `;
      else out += ch === '^' ? script(inner, SUP, '^') : script(inner, SUB, '_');
      i = j;
      continue;
    }
    if (ch === '{' || ch === '}') {
      i++;
      continue;
    }
    if (ch === '~') {
      out += ' ';
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out.replace(/\s+/g, ' ').replace(/\s*([=<>≤≥≠±×÷·→⇒⇔∈+])\s*/g, ' $1 ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+([,.;])/g, '$1').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------- wikitext temizliği

/** İç içe {{…}} ya da {|…|} bloklarını siler. */
function stripNested(s: string, open: string, close: string, keep?: (inner: string) => string | null): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const start = s.indexOf(open, i);
    if (start < 0) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, start);
    let depth = 0;
    let j = start;
    let end = -1;
    while (j < s.length) {
      if (s.startsWith(open, j)) {
        depth++;
        j += open.length;
      } else if (s.startsWith(close, j)) {
        depth--;
        j += close.length;
        if (depth === 0) {
          end = j;
          break;
        }
      } else j++;
    }
    if (end < 0) {
      // kapanmamış: satır sonuna kadar at
      const nl = s.indexOf('\n', start);
      i = nl < 0 ? s.length : nl;
      continue;
    }
    const kept = keep ? keep(s.slice(start + open.length, end - close.length)) : null;
    if (kept) out += kept;
    i = end;
  }
  return out;
}

/** İçeriği metin olarak korunacak birkaç yaygın şablon. */
function keepTemplate(rawInner: string): string | null {
  const inner = rawInner.includes('{{') ? stripNested(rawInner, '{{', '}}', keepTemplate) : rawInner;
  const parts = inner.replace(/\{\{!\}\}/g, '|').split('|').map((p) => p.trim());
  const name = (parts[0] ?? '').toLowerCase();
  const spaced = name.match(/^(sub|sup)\s+(.+)$/);
  if (spaced && parts.length === 1) return script(spaced[2], spaced[1] === 'sup' ? SUP : SUB, spaced[1] === 'sup' ? '^' : '_');
  if (name === 'abs' || name === 'mutlak değer') return `|${parts.slice(1).join(' ')}|`;
  if (name === 'math' || name === 'mvar' || name === 'nowrap' || name === 'lang' || name === 'dil' || name === 'kesir' || name === 'sfrac' || name === 'frac') {
    const args = parts.slice(1).filter((p) => !p.includes('='));
    if (name === 'lang' || name === 'dil') return args[1] ?? null;
    if (name === 'kesir' || name === 'sfrac' || name === 'frac') return args.length >= 2 ? `${args[0]}/${args[1]}` : (args[0] ?? null);
    return args.join(' ') || null;
  }
  if (name === 'sup') return parts[1] ? script(parts[1], SUP, '^') : null;
  if (name === 'sub') return parts[1] ? script(parts[1], SUB, '_') : null;
  if (name === 'öö' || name === 'mö' || name === 'bc') return 'MÖ';
  if (name === 'ms' || name === 'ad') return 'MS';
  return null;
}

/** [[Dosya:…]] gibi iç içe köşeli parantezli bağlantıları siler. */
function stripFileLinks(s: string): string {
  const re = /\[\[(?:Dosya|File|Resim|Image|Görüntü|Media|Ortam|Kategori|Category)\s*:/gi;
  let out = '';
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index < i) continue;
    out += s.slice(i, m.index);
    let depth = 0;
    let j = m.index;
    for (; j < s.length; j++) {
      if (s.startsWith('[[', j)) {
        depth++;
        j++;
      } else if (s.startsWith(']]', j)) {
        depth--;
        j++;
        if (depth === 0) break;
      }
    }
    i = j + 1;
    re.lastIndex = i;
  }
  return out + s.slice(i);
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&minus;/g, '−')
    .replace(/&times;/g, '×')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&harr;/g, '↔')
    .replace(/&rArr;/g, '⇒')
    .replace(/&hArr;/g, '⇔')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&ne;/g, '≠')
    .replace(/&deg;/g, '°')
    .replace(/&plusmn;/g, '±')
    .replace(/&middot;|&sdot;/g, '·')
    .replace(/&hellip;/g, '…')
    .replace(/&prime;/g, '′')
    .replace(/&pi;/g, 'π')
    .replace(/&(shy|zwj|zwnj|lrm|rlm);/g, '')
    .replace(/&(thinsp|hairsp|ensp|emsp|numsp|puncsp);/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/g, '');
}

const MATH_TOKEN = '\u0001';

/** Satır içi işaretlemeyi düz metne çevirir. */
function inline(s: string, maths: string[]): string {
  let t = s
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]([a-zçğıöşüâîû]*)/gi, '$2$3')
    .replace(/\[\[([^\]]*)\]\]([a-zçğıöşüâîû]*)/gi, (_, a: string, suf: string) => a.replace(/#.*/, '').replace(/^:/, '') + suf)
    .replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '$2')
    .replace(/\[https?:\/\/[^\]]+\]/g, '')
    .replace(/'''''|'''|''/g, '')
    .replace(/<sup>([^<]*)<\/sup>/gi, (_, x: string) => script(x.trim(), SUP, '^'))
    .replace(/<sub>([^<]*)<\/sub>/gi, (_, x: string) => script(x.trim(), SUB, '_'))
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '');
  t = decode(t);
  t = t.replace(new RegExp(`${MATH_TOKEN}(\\d+)${MATH_TOKEN}`, 'g'), (_, n) => maths[Number(n)] ?? '');
  t = t
    .replace(/\b(wikt|wiktionary|w|en|de|fr):/g, '')
    .replace(/\[\[|\]\]/g, '')
    .replace(/\(\s*[,;:]?\s*\)/g, '');
  return t.replace(/[ \t]+/g, ' ').replace(/\s+([,.;:!?)])/g, '$1').replace(/\(\s+/g, '(').trim();
}

export function parseWikitext(wikitext: string, title: string): WikiArticle {
  const maths: string[] = [];
  let s = wikitext
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<(gallery|references|timeline|score|graph|mapframe|imagemap|syntaxhighlight|source|div class="noprint"[^>]*)[^>]*>[\s\S]*?<\/(gallery|references|timeline|score|graph|mapframe|imagemap|syntaxhighlight|source|div)>/gi, '')
    .replace(/<math([^>]*)>([\s\S]*?)<\/math>/gi, (_, attrs: string, tex: string) => {
      maths.push(latexToText(tex));
      const block = /display\s*=\s*"?block/.test(attrs);
      return block ? `\n:${MATH_TOKEN}${maths.length - 1}${MATH_TOKEN}\n` : `${MATH_TOKEN}${maths.length - 1}${MATH_TOKEN}`;
    })
    .replace(/<chem>([\s\S]*?)<\/chem>/gi, (_, x: string) => latexToText(x))
    .replace(/__[A-ZÇĞİÖŞÜ]+__/g, '');
  s = stripNested(s, '{{', '}}', keepTemplate);
  s = stripNested(s, '{|', '|}');
  s = stripFileLinks(s);

  const sections: WikiSection[] = [{ title: 'Giriş', level: 1, blocks: [] }];
  let skipping = false;
  let para: string[] = [];
  const flush = () => {
    if (!para.length) return;
    const text = inline(para.join(' '), maths);
    para = [];
    if (!skipping && text.length > 1) sections[sections.length - 1].blocks.push({ t: 'p', text });
  };
  for (const raw of s.split('\n')) {
    const line = raw.trimEnd();
    const h = line.match(/^(={2,5})\s*(.+?)\s*\1\s*$/);
    if (h) {
      flush();
      const name = inline(h[2], maths);
      skipping = SKIP_SECTIONS.test(name);
      if (!skipping) sections.push({ title: name, level: h[1].length, blocks: [] });
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    if (skipping) continue;
    const list = line.match(/^([*#]+)\s*(.*)$/);
    if (list) {
      flush();
      const text = inline(list[2], maths);
      if (text.length > 1) sections[sections.length - 1].blocks.push({ t: 'li', text });
      continue;
    }
    const indent = line.match(/^[:;]+\s*(.*)$/);
    if (indent) {
      flush();
      const onlyMath = indent[1].trim().match(new RegExp(`^${MATH_TOKEN}(\\d+)${MATH_TOKEN}[\\s,.;]*$`));
      const text = onlyMath ? (maths[Number(onlyMath[1])] ?? '') : inline(indent[1], maths);
      if (text.length > 0) sections[sections.length - 1].blocks.push({ t: onlyMath ? 'math' : 'p', text });
      continue;
    }
    if (/^(\||!|\{\||\|\})/.test(line.trim())) continue; // tablo kalıntısı
    const onlyMath = line.trim().match(new RegExp(`^${MATH_TOKEN}(\\d+)${MATH_TOKEN}[\\s,.;]*$`));
    if (onlyMath && !para.length) {
      sections[sections.length - 1].blocks.push({ t: 'math', text: maths[Number(onlyMath[1])] ?? '' });
      continue;
    }
    para.push(line.trim());
  }
  flush();

  // boş bölümleri ve yalnız alt başlık barındıran boş üst bölümleri temizle
  const clean = sections.filter((sec) => sec.blocks.some((b) => b.text.length > 0));
  const chars = clean.reduce((n, sec) => n + sec.blocks.reduce((m, b) => m + b.text.length, 0), 0);
  return { title, sections: clean, chars };
}

/**
 * Sunucu yanıtını (ham wikitext ya da api.php JSON'u) maddeye çevirir.
 * Boş/eksik yanıtta hata fırlatır; canlı katman bunu "önbellekten göster" durumuna çevirir.
 */
export function parseWikiResponse(body: string, title: string): WikiArticle {
  let text = body;
  let resolved = title;
  if (body.trimStart().startsWith('{')) {
    const j = JSON.parse(body) as { query?: { pages?: { title?: string; missing?: boolean; revisions?: { slots?: { main?: { content?: string } } }[] }[] } };
    const page = j.query?.pages?.[0];
    const content = page?.revisions?.[0]?.slots?.main?.content;
    if (!page || page.missing || !content) throw new Error('Madde bulunamadı');
    text = content;
    resolved = page.title ?? title;
  }
  const target = redirectTarget(text);
  if (target) throw new Error(`Madde "${target}" adına taşınmış`);
  const article = parseWikitext(text, resolved);
  if (!article.sections.length) throw new Error('Madde metni okunamadı');
  return article;
}
