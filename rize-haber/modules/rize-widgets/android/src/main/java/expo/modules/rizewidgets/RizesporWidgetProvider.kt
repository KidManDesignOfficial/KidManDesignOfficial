package expo.modules.rizewidgets

import android.content.Context
import android.widget.RemoteViews

/**
 * Çaykur Rizespor: canlı maç, yeni biten maçın skoru ya da sıradaki maç (src/widgets/snapshot.ts pickMatch).
 *
 * Durum yazısı her çizimde saate göre yeniden hesaplanır: başlama saati gelen maç "Başladı" olur;
 * canlı skor 20 dakikadan eskiyse "CANLI" yerine "Son durum" yazar (skor yanıltıcı biçimde güncel görünmez).
 */
class RizesporWidgetProvider : BaseWidgetProvider() {
  override val kind = Kinds.RIZESPOR
  override val defaultSize = WidgetSize(250, 110)

  override fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.rw_rizespor)
    card(views, context, style, "rizespor")
    style.tint(views, R.id.rw_header_icon) { it.accent }
    style.text(views, R.id.rw_title, 13f) { it.accent }
    style.text(views, R.id.rw_status, 11f) { it.muted }
    style.text(views, R.id.rw_home, 15f) { it.text }
    style.text(views, R.id.rw_away, 15f) { it.text }
    style.text(views, R.id.rw_center, 24f) { it.accent }
    style.text(views, R.id.rw_sub, 12f) { it.muted }
    style.text(views, R.id.rw_empty, 13f) { it.muted }

    val m = snapshot?.rizespor
    visible(views, R.id.rw_score_row, m != null)
    visible(views, R.id.rw_sub, m != null && size.height >= 80 * style.textScale)
    visible(views, R.id.rw_empty, m == null)
    // Alçak (4×1) widget'ta başlık gizlenir; takımlar ve skor kalır.
    visible(views, R.id.rw_header, m == null || size.height >= 100 * style.textScale)
    if (m == null) {
      views.setTextViewText(R.id.rw_status, "")
      views.setContentDescription(android.R.id.background, "Çaykur Rizespor. ${context.getString(R.string.rw_open_app)}")
      return views
    }

    val now = System.currentTimeMillis()
    val day = TimeText.day(m.kickoff, now)
    val clock = TimeText.clock(m.kickoff)
    val status: String
    val center: String
    val sub: String
    val spoken: String
    when (m.state) {
      "in" -> {
        val fresh = now - m.savedAt < 20 * 60_000
        status = if (fresh) "CANLI · ${m.status}" else "Son durum · ${m.status}"
        center = m.score ?: "–"
        sub = m.venue ?: "Güncel skor için dokunun"
        spoken = "${if (fresh) "Canlı maç" else "Son bilinen durum"}, ${m.status}: ${m.home} ${spokenScore(m.score)} ${m.away}."
      }
      "post" -> {
        status = "Maç sonu"
        center = m.score ?: "–"
        val result = when (m.result) {
          "G" -> "Galibiyet"
          "B" -> "Beraberlik"
          "M" -> "Mağlubiyet"
          else -> null
        }
        sub = listOfNotNull(day, result).joinToString(" · ")
        spoken = "Maç sonucu, $day: ${m.home} ${spokenScore(m.score)} ${m.away}.${result?.let { " $it." } ?: ""}"
      }
      else -> {
        val started = now >= m.kickoff
        status = if (started) "Başladı" else "${TimeText.until(m.kickoff, now)} sonra"
        center = clock
        sub = listOfNotNull(day, m.venue).joinToString(" · ")
        spoken = "Sıradaki maç: ${m.home} – ${m.away}, ${TimeText.dayLong(m.kickoff, now)} saat $clock" +
          (m.venue?.let { ", $it" } ?: "") + "." + (if (started) " Maç başladı; skor için dokunun." else "")
      }
    }
    views.setTextViewText(R.id.rw_status, status)
    views.setTextViewText(R.id.rw_home, m.home)
    views.setTextViewText(R.id.rw_away, m.away)
    views.setTextViewText(R.id.rw_center, center)
    views.setTextViewText(R.id.rw_sub, sub)
    // Canlı maçta durum yazısı vurgu rengiyle öne çıkar.
    if (m.state == "in") style.textColor(views, R.id.rw_status) { it.accent }
    views.setContentDescription(android.R.id.background, "Çaykur Rizespor. $spoken Rizespor sekmesini açar.")
    return views
  }

  /** "2 – 1" → "2, 1" (ekran okuyucu tireyi "eksi" diye okumasın). */
  private fun spokenScore(score: String?): String = score?.replace(" – ", ", ") ?: ""
}
