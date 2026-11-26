package expo.modules.rizewidgets

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * JS köprüsü (modules/rize-widgets/index.ts):
 * - setSnapshot(json): veriyi saklar ve ana ekrandaki tüm widget'ları yeniden çizer.
 * - getInstalled(): hangi widget'tan kaç tane eklendiği.
 * - canRequestPin() / requestPin(kind): Android 8+ başlatıcısı destekliyorsa "Ana ekrana ekle" penceresi.
 * - publishShortcuts(): uygulama simgesine basılı tutunca açılan kısayollar.
 */
class RizeWidgetsModule : Module() {
  private val context: Context
    get() = appContext.reactContext?.applicationContext ?: throw IllegalStateException("Android bağlamı yok")

  override fun definition() = ModuleDefinition {
    Name("RizeWidgets")

    // Arka plan iş parçacığında: JSON yazma ve widget çizimi arayüzü bekletmez.
    AsyncFunction("setSnapshot") { json: String ->
      SnapshotStore.write(context, json)
      BaseWidgetProvider.refreshAll(context)
    }

    Function("getInstalled") {
      BaseWidgetProvider.installed(context)
    }

    Function("canRequestPin") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        (AppWidgetManager.getInstance(context)?.isRequestPinAppWidgetSupported ?: false)
    }

    Function("requestPin") { kind: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@Function false
      val provider = BaseWidgetProvider.providers().firstOrNull { it.kind == kind } ?: return@Function false
      val manager = AppWidgetManager.getInstance(context) ?: return@Function false
      if (!manager.isRequestPinAppWidgetSupported) return@Function false
      manager.requestPinAppWidget(BaseWidgetProvider.component(context, provider), null, null)
    }

    Function("publishShortcuts") {
      AppShortcuts.publish(context)
    }
  }
}
