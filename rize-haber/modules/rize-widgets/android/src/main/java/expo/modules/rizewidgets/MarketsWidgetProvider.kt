package expo.modules.rizewidgets

import android.content.Context
import android.widget.RemoteViews

/**
 * Döviz, Altın ve Çay: dolar, euro, gram altın (TCMB + ons altın) ve yaş çay alım fiyatı.
 * Geniş ve alçak boyutta değerler yan yana dizilir. Kart Ekonomi, çay satırı Çay sekmesini açar.
 */
class MarketsWidgetProvider : BaseWidgetProvider() {
  override val kind = Kinds.MARKETS
  override val defaultSize = WidgetSize(110, 110)

  private val ids = listOf(
    Pair(R.id.rw_m0_label, R.id.rw_m0_value),
    Pair(R.id.rw_m1_label, R.id.rw_m1_value),
    Pair(R.id.rw_m2_label, R.id.rw_m2_value),
  )
  private val rowIds = listOf(R.id.rw_m0, R.id.rw_m1, R.id.rw_m2)

  override fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews {
    val wide = size.width >= 250 && size.height < 150
    val views = RemoteViews(context.packageName, if (wide) R.layout.rw_markets_wide else R.layout.rw_markets)
    card(views, context, style, "economy")
    style.tint(views, R.id.rw_header_icon) { it.accent }
    style.text(views, R.id.rw_title, 13f) { it.accent }
    style.text(views, R.id.rw_updated, 11f) { it.muted }
    style.text(views, R.id.rw_empty, 13f) { it.muted }
    style.tint(views, R.id.rw_tea_icon) { it.accent }
    style.text(views, R.id.rw_tea_text, 12f) { it.muted }

    val m = snapshot?.markets
    val rows = m?.rows.orEmpty()
    visible(views, R.id.rw_rows, rows.isNotEmpty())
    visible(views, R.id.rw_empty, rows.isEmpty())
    if (m == null || rows.isEmpty()) {
      views.setTextViewText(R.id.rw_updated, "")
      visible(views, R.id.rw_tea, false)
      views.setContentDescription(android.R.id.background, "Piyasalar. ${context.getString(R.string.rw_open_app)}")
      return views
    }

    // Bülten tarihi (ör. "21 Kas"); yoksa verinin alındığı saat.
    views.setTextViewText(R.id.rw_updated, m.date?.let { "$it · TCMB" } ?: TimeText.saved(m.savedAt))
    ids.forEachIndexed { i, (label, value) ->
      val row = rows.getOrNull(i)
      visible(views, rowIds[i], row != null)
      if (row == null) return@forEachIndexed
      views.setTextViewText(label, row.label)
      views.setTextViewText(value, row.value)
      style.text(views, label, if (wide) 12f else 13f) { it.muted }
      style.text(views, value, if (wide) 16f else 15f) { it.text }
    }

    // Dar ve alçak widget'ta başlık ve çay satırı gizlenir; yalnızca değerler kalır.
    val roomy = size.height >= 90 * style.textScale
    visible(views, R.id.rw_header, roomy || !wide)
    val showTea = m.tea != null && size.height >= (if (wide) 100 else 150) * style.textScale
    visible(views, R.id.rw_tea, showTea)
    if (showTea) {
      views.setTextViewText(R.id.rw_tea_text, m.tea)
      views.setOnClickPendingIntent(R.id.rw_tea, Links.pending(context, requestCode(1), "tea"))
      views.setContentDescription(R.id.rw_tea, "${m.tea?.replace("₺/kg", "lira kilogram")}. Çay sekmesini açar.")
    }
    views.setContentDescription(android.R.id.background, "${m.a11y} Ekonomi sekmesini açar.")
    return views
  }
}
