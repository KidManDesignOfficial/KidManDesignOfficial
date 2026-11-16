/**
 * Uygulama sabitleri.
 *
 * Sınav tarihi canlı olarak ÖSYM sınav takviminden okunur (src/lib/osym.ts). ÖSYM gelecek yılın
 * takvimini yayımlamadıysa geri sayım bu TAHMİNİ tarihi kullanır ve ekranda "tahmini" yazar.
 * 16.11.2026 itibarıyla ÖSYM takvim sayfasında yalnızca 2026 yılı vardır (2026-YKS: 20–21 Haziran).
 * Tahmin, YKS'nin son yıllarda Haziran'ın üçüncü hafta sonu yapılmasına dayanır.
 */
export const DEFAULT_EXAM_DATE = '19.06.2027';
export const EXAM_DATE_NOTE = 'Tahmini tarih. ÖSYM 2027 takvimini yayımladığında geri sayım resmî tarihe kendiliğinden geçer.';
export const APP_NAME = 'Hedef YKS';
export const APP_VERSION = '1.0.0';
export const CONTACT_EMAIL = 'cikskral03@gmail.com';
