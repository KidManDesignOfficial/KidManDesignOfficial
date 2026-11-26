package expo.modules.rizewidgets

import android.content.Context
import android.widget.RemoteViews

/** Hızlı Erişim: beş sekmeye tek dokunuş. Veri gerektirmez; yalnızca uygulamanın renklerini alır. */
class ShortcutsWidgetProvider : BaseWidgetProvider() {
  override val kind = Kinds.SHORTCUTS
  override val defaultSize = WidgetSize(250, 40)

  private data class Cell(val root: Int, val bg: Int, val icon: Int, val label: Int, val tab: String, val name: Int)

  private val cells = listOf(
    Cell(R.id.rw_s0, R.id.rw_s0_bg, R.id.rw_s0_icon, R.id.rw_s0_label, "news", R.string.rw_tab_news),
    Cell(R.id.rw_s1, R.id.rw_s1_bg, R.id.rw_s1_icon, R.id.rw_s1_label, "rizespor", R.string.rw_tab_rizespor),
    Cell(R.id.rw_s2, R.id.rw_s2_bg, R.id.rw_s2_icon, R.id.rw_s2_label, "tea", R.string.rw_tab_tea),
    Cell(R.id.rw_s3, R.id.rw_s3_bg, R.id.rw_s3_icon, R.id.rw_s3_label, "economy", R.string.rw_tab_economy),
    Cell(R.id.rw_s4, R.id.rw_s4_bg, R.id.rw_s4_icon, R.id.rw_s4_label, "weather", R.string.rw_tab_weather),
  )

  override fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.rw_shortcuts)
    style.tint(views, R.id.rw_bg) { it.bg }
    // Etiketler dar widget'ta ve büyük yazıda sığmazsa gizlenir; düğmeler yine sesli adlarıyla okunur.
    val labels = size.height >= 64 * style.textScale && size.width >= 220 * style.textScale
    cells.forEachIndexed { i, c ->
      val name = context.getString(c.name)
      style.tint(views, c.bg) { it.accent }
      style.tint(views, c.icon) { it.onFill }
      style.text(views, c.label, 11f) { it.text }
      visible(views, c.label, labels)
      views.setOnClickPendingIntent(c.root, Links.pending(context, requestCode(i), c.tab))
      views.setContentDescription(c.root, "$name sekmesini aç")
    }
    return views
  }
}
