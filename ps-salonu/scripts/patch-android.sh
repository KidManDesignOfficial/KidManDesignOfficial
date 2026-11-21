#!/usr/bin/env bash
# `npx cap add android` sonrası çalışır: ikon, sürüm, yönlendirme ve imza ayarlarını uygular.
set -euo pipefail
cd "$(dirname "$0")/.."
RES=android/app/src/main/res
rm -rf "$RES"/mipmap-anydpi-v26
for d in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  n=${d%%:*}; s=${d##*:}
  convert store/icon-1024.png -resize ${s}x${s} "$RES/mipmap-$n/ic_launcher.png"
  convert store/icon-1024.png -resize ${s}x${s} \( +clone -alpha extract -fill black -colorize 100 -fill white -draw "circle $((s/2)),$((s/2)) $((s/2)),0" \) -alpha off -compose copy_opacity -composite "$RES/mipmap-$n/ic_launcher_round.png"
  rm -f "$RES/mipmap-$n/ic_launcher_foreground.png"
done
MANIFEST=android/app/src/main/AndroidManifest.xml
sed -i 's/<activity/<activity android:screenOrientation="portrait"/' "$MANIFEST"
G=android/app/build.gradle
sed -i "s/versionCode 1/versionCode ${VERSION_CODE:-1}/; s/versionName \"1.0\"/versionName \"${VERSION_NAME:-1.0.0}\"/" "$G"
cat >> "$G" <<'GRADLE'

android {
    signingConfigs {
        play {
            if (System.getenv("PS_KEYSTORE_PATH")) {
                storeFile file(System.getenv("PS_KEYSTORE_PATH"))
                storePassword System.getenv("PS_KEYSTORE_PASSWORD")
                keyAlias System.getenv("PS_KEY_ALIAS")
                keyPassword System.getenv("PS_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            signingConfig System.getenv("PS_KEYSTORE_PATH") ? signingConfigs.play : signingConfigs.debug
        }
    }
}
GRADLE
