import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { apply } = require('../plugins/withReleaseSigning.js');
const template = readFileSync(new URL('./fixtures/gradle/app-build.gradle', import.meta.url), 'utf8');

test('İmza eklentisi: release yapılandırması eklenir ve koşullu kullanılır', () => {
  const out: string = apply(template);
  assert.match(out, /release \{\s+if \(System\.getenv\('RIZE_KEYSTORE_PATH'\)\)/);
  assert.match(out, /signingConfig System\.getenv\('RIZE_KEYSTORE_PATH'\) \? signingConfigs\.release : signingConfigs\.debug/);
  // Debug yapı türü hâlâ debug anahtarını kullanır.
  assert.match(out, /debug \{\s+signingConfig signingConfigs\.debug/);
  // Şifre ya da anahtar içeriği dosyaya yazılmaz.
  assert.doesNotMatch(out, /storePassword '(?!android)/);
});

test('İmza eklentisi iki kez uygulansa da dosya değişmez', () => {
  const once: string = apply(template);
  assert.equal(apply(once), once);
});

test('Beklenmeyen şablonda açık hata verir (sessizce imzasız APK üretmez)', () => {
  assert.throws(() => apply('android { }'), /signingConfigs\.debug bulunamadı/);
});
