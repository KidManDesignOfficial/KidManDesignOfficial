#!/usr/bin/env bash
# APK'yı emülatöre kurar, açar ve 25 sn sonra hâlâ çalışıyor mu bakar.
# Çökme kaydını (logcat) ve ekran görüntüsünü smoke/ klasörüne yazar.
set -u
PKG=com.kidmandesign.hedefyks
APK=$(ls apk/*.apk | head -1)
mkdir -p smoke

adb install -r "$APK"
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
sleep 25

adb logcat -d > smoke/logcat.txt
adb shell screencap -p /sdcard/ekran.png && adb pull /sdcard/ekran.png smoke/ekran.png
PID=$(adb shell pidof "$PKG" | tr -d '\r' || true)

echo "===== Hata kayıtları ====="
grep -E "FATAL|AndroidRuntime|ReactNativeJS|Exception|Error:" smoke/logcat.txt | grep -v "^--------- beginning" | head -150

if [ -z "$PID" ]; then
  echo "SONUÇ: UYGULAMA ÇÖKTÜ (açıldıktan sonra süreç kapandı)"
  exit 1
fi
echo "SONUÇ: Uygulama açık ve çalışıyor (pid $PID)"
