/**
 * Yayın (release) APK'sını kalıcı anahtarla imzalar.
 *
 * Anahtar ve şifreler hiçbir dosyaya yazılmaz; derleme sırasında ortam değişkenlerinden okunur:
 *   YKS_KEYSTORE_PATH, YKS_KEYSTORE_PASSWORD, YKS_KEY_ALIAS, YKS_KEY_PASSWORD
 * Bu değişkenler yoksa (ör. yerel deneme) derleme bozulmaz, hata ayıklama anahtarıyla devam eder.
 * GitHub Actions'ta bu değerler depo "Secrets" bölümünden gelir (bkz. README → İmza anahtarı).
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_CONFIG = `
        release {
            if (System.getenv('YKS_KEYSTORE_PATH')) {
                storeFile file(System.getenv('YKS_KEYSTORE_PATH'))
                storePassword System.getenv('YKS_KEYSTORE_PASSWORD')
                keyAlias System.getenv('YKS_KEY_ALIAS')
                keyPassword System.getenv('YKS_KEY_PASSWORD')
            }
        }`;

const MARKER = '// hedef-yks: release-signing';

function apply(gradle) {
  if (gradle.includes(MARKER)) return gradle;

  // 1) signingConfigs içine "release" ekle (debug bloğunun hemen ardına).
  const debugBlock = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/m;
  if (!debugBlock.test(gradle)) throw new Error('withReleaseSigning: signingConfigs.debug bulunamadı');
  gradle = gradle.replace(debugBlock, `$1${RELEASE_CONFIG}`);

  // 2) buildTypes.release içinde imza yapılandırmasını koşullu yap.
  const releaseUse = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/m;
  if (!releaseUse.test(gradle)) throw new Error('withReleaseSigning: buildTypes.release imza satırı bulunamadı');
  gradle = gradle.replace(
    releaseUse,
    `$1${MARKER}\n            signingConfig System.getenv('YKS_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug`,
  );
  return gradle;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') throw new Error('withReleaseSigning: yalnızca Groovy build.gradle desteklenir');
    cfg.modResults.contents = apply(cfg.modResults.contents);
    return cfg;
  });
};

module.exports.apply = apply;
