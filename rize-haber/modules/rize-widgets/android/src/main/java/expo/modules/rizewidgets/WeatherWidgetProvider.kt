package expo.modules.rizewidgets

import android.content.Context
import android.widget.RemoteViews

/** Hava Durumu: seçili konumun anlık havası; genişse önümüzdeki saatler. Dokununca Hava sekmesi açılır. */
class WeatherWidgetProvider : BaseWidgetProvider() {
  override val kind = Kinds.WEATHER
  override val defaultSize = WidgetSize(110, 110)

  override fun build(context: Context, snapshot: Snapshot?, style: WidgetStyle, size: WidgetSize): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.rw_weather)
    card(views, context, style, "weather", fill = true)
    val onFill: (Palette) -> Int = { it.onFill }
    val soft: (Palette) -> Int = { (it.onFill and 0x00FFFFFF) or (0xD9 shl 24) }

    style.tint(views, R.id.rw_place_icon, onFill)
    style.tint(views, R.id.rw_icon, onFill)
    style.text(views, R.id.rw_place, 13f, onFill)
    style.text(views, R.id.rw_temp, if (size.height < 130) 34f else 42f, onFill)
    style.text(views, R.id.rw_label, 14f, onFill)
    style.text(views, R.id.rw_detail, 12f, soft)

    val w = snapshot?.weather
    if (w == null) {
      views.setTextViewText(R.id.rw_place, context.getString(R.string.rw_weather_label))
      views.setTextViewText(R.id.rw_temp, "–°")
      views.setImageViewResource(R.id.rw_icon, R.drawable.rw_ic_weather)
      views.setTextViewText(R.id.rw_label, "")
      views.setTextViewText(R.id.rw_detail, context.getString(R.string.rw_open_app))
      visible(views, R.id.rw_hours, false)
      views.setContentDescription(android.R.id.background, context.getString(R.string.rw_open_app))
      return views
    }

    views.setTextViewText(R.id.rw_place, w.place)
    views.setTextViewText(R.id.rw_temp, w.temp)
    views.setImageViewResource(R.id.rw_icon, icon(w.icon))
    views.setTextViewText(R.id.rw_label, w.label)
    // Alçak widget'ta tek satır: en yüksek/düşük; yeterince yer varsa ayrıntı ve güncelleme saati de.
    val tall = size.height >= 150 * style.textScale
    val updated = "${TimeText.saved(w.savedAt)} itibarıyla"
    val detail = listOfNotNull(w.hiLo, if (tall) w.detail else null).joinToString(" · ")
    views.setTextViewText(R.id.rw_detail, if (tall) "$detail\n$updated" else detail.ifEmpty { updated })

    // Geniş widget: sağda 4 zaman dilimi.
    val wide = size.width >= 250 && w.hours.size >= 4
    visible(views, R.id.rw_hours, wide)
    if (wide) {
      val ids = listOf(
        Triple(R.id.rw_h0_time, R.id.rw_h0_icon, R.id.rw_h0_temp),
        Triple(R.id.rw_h1_time, R.id.rw_h1_icon, R.id.rw_h1_temp),
        Triple(R.id.rw_h2_time, R.id.rw_h2_icon, R.id.rw_h2_temp),
        Triple(R.id.rw_h3_time, R.id.rw_h3_icon, R.id.rw_h3_temp),
      )
      ids.forEachIndexed { i, (time, image, temp) ->
        val h = w.hours[i]
        views.setTextViewText(time, h.time)
        views.setTextViewText(temp, h.temp)
        views.setImageViewResource(image, icon(h.icon))
        style.text(views, time, 11f, soft)
        style.text(views, temp, 13f, onFill)
        style.tint(views, image, onFill)
      }
    }

    val hours = if (wide) " Önümüzdeki saatler: " + w.hours.joinToString(", ") { "${it.time} ${it.temp.replace("°", " derece")}" } + "." else ""
    views.setContentDescription(android.R.id.background, "${w.a11y}$hours Güncelleme $updated. Hava sekmesini açar.")
    return views
  }

  private fun icon(name: String): Int = when (name) {
    "sunny" -> R.drawable.rw_ic_sunny
    "moon" -> R.drawable.rw_ic_moon
    "partly" -> R.drawable.rw_ic_partly
    "partly_night" -> R.drawable.rw_ic_partly_night
    "rain" -> R.drawable.rw_ic_rain
    "snow" -> R.drawable.rw_ic_snow
    "storm" -> R.drawable.rw_ic_storm
    else -> R.drawable.rw_ic_cloudy
  }
}
