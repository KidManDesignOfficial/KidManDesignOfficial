/**
 * Ortak ağ isteği katmanı: zaman aşımı, geçici hatalarda yeniden deneme ve iptal.
 *
 * Tüm veri kaynakları (haberler, kurlar, altın, hava, çay fiyatı, Rizespor) bunu kullanır; böylece
 * yaylada zayıf çeken bir bağlantıda istek sonsuza dek asılı kalmaz, tek bir kopukluk da ekranı
 * hataya düşürmez. React Native'e bağımlı değildir; Node ile doğrudan test edilir.
 */

/** Sunucu 2xx dışında bir yanıt verdi. */
export class HttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** İstek süre sınırını aştı. */
export class TimeoutError extends Error {
  constructor() {
    super('İstek zaman aşımına uğradı.');
    this.name = 'TimeoutError';
  }
}

export type RequestOptions = {
  /** Çağıranın iptal sinyali (ekran kapandı, yeni istek başladı…). İptal yeniden denenmez. */
  signal?: AbortSignal;
  /** Her denemenin süre sınırı (ms). */
  timeoutMs?: number;
  /** Geçici hatalarda en fazla kaç kez daha denenecek. */
  retries?: number;
  /** İlk yeniden denemeden önceki bekleme (ms); her denemede iki katına çıkar. */
  backoffMs?: number;
  headers?: Record<string, string>;
  /** Testler için: `fetch` yerine kullanılacak işlev. */
  fetchImpl?: typeof fetch;
};

export const DEFAULT_TIMEOUT_MS = 12_000;
export const DEFAULT_RETRIES = 1;
const DEFAULT_BACKOFF_MS = 700;

/** Yeniden denemeye değer bir HTTP durumu mu? (zaman aşımı, hız sınırı, sunucu hatası) */
export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function abortError(): Error {
  const e = new Error('İstek iptal edildi.');
  e.name = 'AbortError';
  return e;
}

/** Çağıranın sinyaline saygı duyan bekleme. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Tek deneme: süre sınırı ve çağıranın sinyali birlikte uygulanır. */
async function attempt(url: string, opts: RequestOptions, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort();
  if (opts.signal?.aborted) controller.abort();
  opts.signal?.addEventListener('abort', onAbort);
  try {
    const res = await (opts.fetchImpl ?? fetch)(url, { signal: controller.signal, headers: opts.headers });
    if (!res.ok) throw new HttpError(res.status);
    return res;
  } catch (e) {
    if (timedOut && !opts.signal?.aborted) throw new TimeoutError();
    throw e;
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * `fetch` + süre sınırı + geçici hatalarda üstel beklemeyle yeniden deneme.
 * 4xx yanıtlar (408/425/429 dışında) ve çağıranın iptali hemen hata olarak döner.
 */
export async function request(url: string, opts: RequestOptions = {}): Promise<Response> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = Math.max(0, opts.retries ?? DEFAULT_RETRIES);
  const backoff = opts.backoffMs ?? DEFAULT_BACKOFF_MS;
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    if (opts.signal?.aborted) throw abortError();
    try {
      return await attempt(url, opts, timeoutMs);
    } catch (e) {
      lastError = e;
      if (opts.signal?.aborted) throw abortError();
      const retryable = e instanceof HttpError ? isRetryableStatus(e.status) : true;
      if (!retryable || i === retries) break;
      await sleep(backoff * 2 ** i, opts.signal);
    }
  }
  throw lastError;
}

export async function requestText(url: string, opts?: RequestOptions): Promise<string> {
  return (await request(url, opts)).text();
}

export async function requestJson(url: string, opts?: RequestOptions): Promise<unknown> {
  const text = await requestText(url, opts);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Sunucudan okunamayan bir yanıt geldi.');
  }
}

/** Çağıranın iptali mi? (ekranda hata olarak gösterilmez) */
export function isAbort(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError';
}

/** Kullanıcıya gösterilecek kısa, anlaşılır hata metni. */
export function friendlyError(e: unknown, what = 'Veri'): string {
  if (e instanceof TimeoutError) return `${what} zamanında gelmedi. Bağlantınız yavaş olabilir.`;
  if (e instanceof HttpError) {
    if (e.status === 429) return `${what} kaynağı şu an yoğun. Birazdan yeniden deneyin.`;
    if (e.status >= 500) return `${what} kaynağı geçici olarak yanıt vermiyor.`;
    return `${what} alınamadı (HTTP ${e.status}).`;
  }
  return `${what} alınamadı. İnternet bağlantınızı kontrol edin.`;
}
