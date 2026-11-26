package expo.modules.rizewidgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.RemoteViews

/** Widget'ın ana ekrandaki boyutu (dp). Dikey ekrandaki genişlik ve yükseklik kullanılır. */
data class WidgetSize(val width: Int, val height: Int)

/**
 * Tüm Rize Haber widget'larının ortak davranışı: veriyi okur, boyuta göre düzeni seçer, çizer.
 *
 * Widget kendi başına ağa çıkmaz; veriyi uygulama (açıkken ya da ~30 dakikada bir çalışan arka plan
 * görevinde) yazar. Sistem `updatePeriodMillis` ile widget'ı ayrıca yeniden çizdirir; böylece
 * "12 dk önce", "Bugün" gibi zamana bağlı yazılar veri değişmese de güncel kalır.
 */
abstract class BaseWidgetProvider : AppWidgetProvider() {
  abstract val kind: String

  /** Varsayılan boyut (seçenekler gelmezse; bilgi dosyasındaki minWidth/minHeight). */
  protected abstract val defaultSize: WidgetSize

  protected abstract fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews

  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    val snapshot = SnapshotStore.read(context)
    ids.forEach { render(context, manager, it, snapshot) }
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    render(context, manager, id, SnapshotStore.read(context))
  }

  fun render(context: Context, manager: AppWidgetManager, id: Int, snapshot: Snapshot?) {
    try {
      val options = manager.getAppWidgetOptions(id)
      val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
      val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT)
      val size = if (width > 0 && height > 0) WidgetSize(width, height) else defaultSize
      manager.updateAppWidget(id, build(context, snapshot, WidgetStyle(context, snapshot), size))
    } catch (e: Exception) {
      // Bozuk veri ya da başlatıcı hatası uygulamayı değil yalnızca bu çizimi etkilesin.
      Log.w(TAG, "$kind widget'ı çizilemedi", e)
    }
  }

  protected fun visible(views: RemoteViews, id: Int, show: Boolean) =
    views.setViewVisibility(id, if (show) View.VISIBLE else View.GONE)

  /** Kart zemini (yuvarlatılmış şekil) ve kartın tamamına dokununca açılacak sekme. */
  protected fun card(views: RemoteViews, context: Context, style: WidgetStyle, tab: String, fill: Boolean = false) {
    style.tint(views, R.id.rw_bg) { if (fill) it.fill else it.bg }
    views.setOnClickPendingIntent(android.R.id.background, Links.pending(context, requestCode(0), tab))
  }

  /** Widget türüne göre ayrık istek kodları: 1000 weather, 2000 news … + dokunma noktası. */
  protected fun requestCode(slot: Int): Int = (KINDS.indexOf(kind) + 1) * 1000 + slot

  companion object {
    private const val TAG = "RizeWidgets"
    val KINDS = listOf(Kinds.WEATHER, Kinds.NEWS, Kinds.MARKETS, Kinds.RIZESPOR, Kinds.SHORTCUTS)

    fun providers(): List<BaseWidgetProvider> = listOf(
      WeatherWidgetProvider(),
      NewsWidgetProvider(),
      MarketsWidgetProvider(),
      RizesporWidgetProvider(),
      ShortcutsWidgetProvider(),
    )

    fun component(context: Context, provider: BaseWidgetProvider) = ComponentName(context, provider.javaClass)

    /** Ana ekrandaki tüm Rize Haber widget'larını yeni veriyle yeniden çizer. */
    fun refreshAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context) ?: return
      val snapshot = SnapshotStore.read(context)
      for (provider in providers()) {
        val ids = try {
          manager.getAppWidgetIds(component(context, provider))
        } catch (e: Exception) {
          IntArray(0)
        }
        ids.forEach { provider.render(context, manager, it, snapshot) }
      }
    }

    /** Ana ekrana eklenmiş widget sayıları (tür → adet). */
    fun installed(context: Context): Map<String, Int> {
      val manager = AppWidgetManager.getInstance(context) ?: return emptyMap()
      return providers().associate { p ->
        p.kind to try {
          manager.getAppWidgetIds(component(context, p)).size
        } catch (e: Exception) {
          0
        }
      }
    }
  }
}
