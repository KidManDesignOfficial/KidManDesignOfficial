/** Telefonda (Android/iOS) harita sayfasını WebView içinde çalıştırır. Web sürümü: CityWebView.web.tsx */
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import type { CityCommand, CityMessage } from './cityPage';

// Paketin tür tanımı varsayılan `P = undefined` ile katı modda props'u `never` yapıyor; açıkça örnekliyoruz.
const WebView = RNWebView<object>;
type WebViewRef = RNWebView<object>;

export type CityWebViewHandle = { send: (cmd: CityCommand) => void };

type Props = { html: string; onMessage: (m: CityMessage) => void };

export const CityWebView = forwardRef<CityWebViewHandle, Props>(function CityWebView({ html, onMessage }, ref) {
  const view = useRef<WebViewRef>(null);
  useImperativeHandle(ref, () => ({
    send: (cmd) => view.current?.injectJavaScript(`window.cityCmd && window.cityCmd(${JSON.stringify(cmd)}); true;`),
  }));
  return (
    <WebView
      ref={view}
      source={{ html, baseUrl: 'https://localhost/' }}
      originWhitelist={['*']}
      style={styles.web}
      containerStyle={styles.web}
      onMessage={(e: WebViewMessageEvent) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data) as CityMessage);
        } catch {
          // yok say
        }
      }}
      onError={() => onMessage({ type: 'error', reason: 'offline' })}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      androidLayerType="hardware"
      allowsInlineMediaPlayback={false}
      mediaPlaybackRequiresUserAction
      cacheEnabled
      // Harita dışı bağlantılar (ör. OpenStreetMap atfı) WebView içinde açılmasın.
      onShouldStartLoadWithRequest={(r: WebViewNavigation) => {
        if (r.url.startsWith('https://localhost') || r.url === 'about:blank') return true;
        if (r.url.startsWith('https://')) Linking.openURL(r.url).catch(() => {});
        return false;
      }}
    />
  );
});

const styles = StyleSheet.create({ web: { flex: 1, backgroundColor: 'transparent' } });
