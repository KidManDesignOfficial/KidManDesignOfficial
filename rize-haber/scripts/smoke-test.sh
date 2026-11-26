#!/usr/bin/env bash
# APK'yı emülatöre kurar, açar ve 25 sn sonra hâlâ çalışıyor mu bakar; widget bağlantısını ve
# ana ekran widget'larının sistemde kayıtlı olduğunu denetler.
# Çökme kaydını (logcat) ve ekran görüntüsünü smoke/ klasörüne yazar.
set -u
PKG=com.kidmandesign.rizehaber
APK=$(ls apk/*.apk | head -1)
mkdir -p smoke

adb install -r "$APK"
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
sleep 25

# Widget/kısayol bağlantısı: uygulama açıkken gelen rizehaber://open bağlantısı çökertmemeli (onNewIntent yolu).
adb shell am start -n "$PKG/.MainActivity" -a android.intent.action.VIEW -d "rizehaber://open?tab=weather" >/dev/null
sleep 5

adb logcat -d > smoke/logcat.txt
adb shell screencap -p /sdcard/ekran.png && adb pull /sdcard/ekran.png smoke/ekran.png
PID=$(adb shell pidof "$PKG" | tr -d '\r' || true)

echo "===== Hata kayıtları ====="
grep -E "FATAL|AndroidRuntime|ReactNativeJS|Exception|Error:" smoke/logcat.txt | grep -v "^--------- beginning" | head -150

if [ -z "$PID" ]; then
  echo "SONUÇ: UYGULAMA ÇÖKTÜ (açıldıktan sonra süreç kapandı)"
  exit 1
fi

# Ana ekran widget'ları sistemde kayıtlı mı (manifest birleştirmesi ve bilgi dosyaları doğru mu)?
adb shell dumpsys appwidget > smoke/appwidget.txt
WIDGETS=$(grep -oE "expo\.modules\.rizewidgets\.[A-Za-z]+WidgetProvider" smoke/appwidget.txt | sort -u)
echo "===== Kayıtlı widget'lar ====="
echo "$WIDGETS"
COUNT=$(echo "$WIDGETS" | grep -c WidgetProvider || true)
if [ "$COUNT" -lt 5 ]; then
  echo "SONUÇ: WIDGET KAYDI EKSİK ($COUNT/5)"
  exit 1
fi
echo "SONUÇ: Uygulama açık ve çalışıyor (pid $PID)"
