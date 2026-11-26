package expo.modules.rizewidgets

import android.content.Context
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Log

/**
 * Uygulama simgesine basılı tutunca açılan kısayollar (Android 7.1+). Kısayol ana ekrana ayrıca
 * sürüklenip bırakılabilir. Uygulama her açılışta listeyi yeniler (sistem sınırına takılmadan, ön planda).
 */
object AppShortcuts {
  private data class Item(val id: String, val tab: String, val short: String, val long: String, val icon: Int)

  private val ITEMS = listOf(
    Item("tab-news", "news", "Haberler", "Son haberler", R.drawable.rw_sc_news),
    Item("tab-rizespor", "rizespor", "Rizespor", "Çaykur Rizespor maçları", R.drawable.rw_sc_rizespor),
    Item("tab-tea", "tea", "Çay", "Yaş çay fiyatı", R.drawable.rw_sc_tea),
    Item("tab-weather", "weather", "Hava", "Hava durumu", R.drawable.rw_sc_weather),
    Item("tab-economy", "economy", "Ekonomi", "Döviz ve altın", R.drawable.rw_sc_economy),
  )

  /** @return eklenen kısayol sayısı (desteklenmiyorsa 0). */
  fun publish(context: Context): Int {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return 0
    return try {
      val manager = context.getSystemService(ShortcutManager::class.java) ?: return 0
      // Başlatıcıların çoğu en fazla 4–5 kısayol gösterir; sıralama (rank) önemlidir.
      val max = manager.maxShortcutCountPerActivity.coerceAtMost(ITEMS.size)
      val list = ITEMS.take(max).mapIndexed { rank, item ->
        ShortcutInfo.Builder(context, item.id)
          .setShortLabel(item.short)
          .setLongLabel(item.long)
          .setIcon(Icon.createWithResource(context, item.icon))
          .setIntent(Links.intent(context, item.tab))
          .setRank(rank)
          .build()
      }
      manager.dynamicShortcuts = list
      list.size
    } catch (e: Exception) {
      // Sınır aşımı (IllegalStateException) ya da başlatıcı desteklemiyorsa sessizce geç.
      Log.w("RizeWidgets", "Kısayollar eklenemedi", e)
      0
    }
  }
}
