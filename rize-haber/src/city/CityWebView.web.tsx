/** Web önizlemesi: harita sayfası iframe içinde; komutlar postMessage ile gider. */
import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import type { CityCommand, CityMessage } from './cityPage';

export type CityWebViewHandle = { send: (cmd: CityCommand) => void };

type Props = { html: string; onMessage: (m: CityMessage) => void };

export const CityWebView = forwardRef<CityWebViewHandle, Props>(function CityWebView({ html, onMessage }, ref) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useImperativeHandle(ref, () => ({
    send: (cmd) => frame.current?.contentWindow?.postMessage(JSON.stringify(cmd), '*'),
  }));

  useEffect(() => {
    const listen = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      try {
        handler.current(JSON.parse(String(e.data)) as CityMessage);
      } catch {
        // yok say
      }
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, []);

  return createElement('iframe', {
    ref: frame,
    srcDoc: html,
    title: 'Rize kuşbakışı harita',
    style: { border: 0, width: '100%', height: '100%', display: 'block' },
  });
});
