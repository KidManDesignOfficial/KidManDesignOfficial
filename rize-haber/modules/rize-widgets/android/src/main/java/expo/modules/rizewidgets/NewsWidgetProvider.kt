package expo.modules.rizewidgets

import android.content.Context
import android.widget.RemoteViews

/** Son Haberler: yüksekliğe göre 1–4 başlık. Satıra dokununca o haber, başlığa dokununca Haberler sekmesi açılır. */
class NewsWidgetProvider : BaseWidgetProvider() {
  override val kind = Kinds.NEWS
  override val defaultSize = WidgetSize(250, 110)

  private val rows = listOf(
    Row(R.id.rw_n0, R.id.rw_n0_title, R.id.rw_n0_meta, null),
    Row(R.id.rw_n1, R.id.rw_n1_title, R.id.rw_n1_meta, R.id.rw_n1_div),
    Row(R.id.rw_n2, R.id.rw_n2_title, R.id.rw_n2_meta, R.id.rw_n2_div),
    Row(R.id.rw_n3, R.id.rw_n3_title, R.id.rw_n3_meta, R.id.rw_n3_div),
  )

  private data class Row(val root: Int, val title: Int, val meta: Int, val divider: Int?)

  override fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.rw_news)
    card(views, context, style, "news")
    style.tint(views, R.id.rw_header_icon) { it.accent }
    style.text(views, R.id.rw_title, 13f) { it.accent }
    style.text(views, R.id.rw_updated, 11f) { it.muted }
    style.text(views, R.id.rw_empty, 13f) { it.muted }
    views.setOnClickPendingIntent(R.id.rw_header, Links.pending(context, requestCode(1), "news"))

    val news = snapshot?.news
    val items = news?.items.orEmpty()
    visible(views, R.id.rw_rows, items.isNotEmpty())
    visible(views, R.id.rw_empty, items.isEmpty())
    if (news == null || items.isEmpty()) {
      views.setTextViewText(R.id.rw_updated, "")
      views.setContentDescription(R.id.rw_header, "Rize Haber. ${context.getString(R.string.rw_open_app)}")
      return views
    }
    views.setTextViewText(R.id.rw_updated, TimeText.saved(news.savedAt))
    views.setContentDescription(R.id.rw_header, "Rize Haber, son haberler. Güncelleme ${TimeText.saved(news.savedAt)}. Haberler sekmesini açar.")

    // Başlık ~24dp; her satır (2 satırlık başlık + kaynak) yazı ölçeğine göre ~58–75dp.
    val rowHeight = 58f * style.textScale
    val fit = (((size.height - 40) / rowHeight).toInt()).coerceIn(1, rows.size)
    val count = minOf(fit, items.size)
    rows.forEachIndexed { i, row ->
      val show = i < count
      visible(views, row.root, show)
      row.divider?.let {
        visible(views, it, show)
        style.background(views, it) { p -> p.divider }
      }
      if (!show) return@forEachIndexed
      val item = items[i]
      val ago = item.publishedAt?.let { TimeText.ago(it) }
      val meta = listOfNotNull(item.source.ifBlank { null }, ago).joinToString(" · ")
      views.setTextViewText(row.title, item.title)
      views.setTextViewText(row.meta, meta)
      // Tek haber sığıyorsa başlık 3 satıra kadar uzayabilir.
      views.setInt(row.title, "setMaxLines", if (count == 1 && size.height >= 100) 3 else 2)
      style.text(views, row.title, 14f) { it.text }
      style.text(views, row.meta, 11f) { it.muted }
      views.setOnClickPendingIntent(row.root, Links.pending(context, requestCode(10 + i), "news", item.url))
      views.setContentDescription(row.root, "Haber: ${item.title}. ${meta}. Açmak için dokunun.")
    }
    return views
  }
}
