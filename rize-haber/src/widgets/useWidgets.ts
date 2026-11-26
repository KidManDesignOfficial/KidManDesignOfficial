/**
 * Uygulama açıkken widget'ları ve kısayolları güncel tutan kancalar (App.tsx → Main).
 */
import { useEffect, useRef } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { publishShortcuts } from '../../modules/rize-widgets';
import { refreshBackgroundTask } from '../notifications';
import { useTheme } from '../theme';
import { parseWidgetLink, type WidgetLink } from './links';
import { syncWidgets } from './sync';

/**
 * - Açılışta: kısayolları yayımlar, arka plan görevini (widget varsa) kaydeder, widget'ları tazeler.
 * - Arka plana geçerken: ekranların o ana kadar indirdiği en yeni veriyle widget'ları günceller.
 * - Görünüm ayarı değişince (renk, palet, tek renk, tema, yazı boyutu, varsayılan konum): widget'lar
 *   kısa bir beklemeyle yeni ayarlarla yeniden çizilir.
 */
export function useWidgetSync(): void {
  const { settings } = useTheme();
  const { accent, palette, monochrome, mode, textSize, weatherLocationId } = settings;
  const first = useRef(true);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    publishShortcuts();
    refreshBackgroundTask().catch(() => {});
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      syncWidgets();
      refreshBackgroundTask().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // Ayar diske yazıldıktan sonra okunsun diye kısa bekleme; açılışta hemen.
    const delay = first.current ? 0 : 800;
    first.current = false;
    const t = setTimeout(() => {
      syncWidgets();
    }, delay);
    return () => clearTimeout(t);
  }, [accent, palette, monochrome, mode, textSize, weatherLocationId]);
}

/**
 * Widget'a ya da kısayola dokunularak açılan bağlantıyı (rizehaber://open?tab=…) yakalar.
 * Uygulama kapalıyken açıldıysa ilk bağlantı bir kez, açıkken gelenler her seferinde işlenir.
 */
export function useWidgetLinks(onLink: (link: WidgetLink) => void): void {
  const handler = useRef(onLink);
  useEffect(() => {
    handler.current = onLink;
  }, [onLink]);

  useEffect(() => {
    let active = true;
    const handle = (url: string | null | undefined) => {
      const link = parseWidgetLink(url);
      if (link && active) handler.current(link);
    };
    Linking.getInitialURL().then(handle, () => {});
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
}
