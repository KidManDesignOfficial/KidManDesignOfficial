package expo.modules.rizewidgets

import android.content.Context
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews

/**
 * Widget'ın renklerini ve yazı boyutlarını uygular.
 *
 * - Renkler uygulamanın temasından gelir (vurgu rengi, palet, "Tek renk" düzeni). Tema "Sistem" ise
 *   Android 12+ telefonda iki renk birden verilir ve sistem, koyu moda geçildiği an doğru olanı seçer
 *   (`setColorInt`); daha eski sürümlerde widget çizildiği andaki mod kullanılır.
 * - Yazılar `sp` birimindedir, yani telefonun yazı boyutu ayarına uyar; üstüne uygulamadaki
 *   "Yazı boyutu" ayarı (Büyük / Çok büyük) da uygulanır.
 */
class WidgetStyle(context: Context, snapshot: Snapshot?) {
  private val theme: Theme = snapshot?.theme ?: DEFAULT_THEME
  private val scale: Float = snapshot?.textScale ?: 1f
  private val systemNight: Boolean =
    (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

  /** Sistem moduna uyan çift renk kullanılabilir mi? */
  private val dual: Boolean = theme.mode == "system" && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S

  private val night: Boolean = when (theme.mode) {
    "dark" -> true
    "light" -> false
    else -> systemNight
  }

  /** Şu anki moddaki palet (çift renk desteklenmiyorsa ya da tek renk gerekiyorsa). */
  val palette: Palette get() = if (night) theme.dark else theme.light

  private fun apply(views: RemoteViews, id: Int, method: String, role: (Palette) -> Int) {
    if (dual && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      views.setColorInt(id, method, role(theme.light), role(theme.dark))
    } else {
      views.setInt(id, method, role(palette))
    }
  }

  fun textColor(views: RemoteViews, id: Int, role: (Palette) -> Int) = apply(views, id, "setTextColor", role)

  /** Simge ya da arka plan şeklini (ImageView) renklendirir. */
  fun tint(views: RemoteViews, id: Int, role: (Palette) -> Int) = apply(views, id, "setColorFilter", role)

  fun background(views: RemoteViews, id: Int, role: (Palette) -> Int) = apply(views, id, "setBackgroundColor", role)

  /** Metin rengi + boyutu. */
  fun text(views: RemoteViews, id: Int, sp: Float, role: (Palette) -> Int) {
    views.setTextViewTextSize(id, TypedValue.COMPLEX_UNIT_SP, sp * scale)
    textColor(views, id, role)
  }

  /** Yazı ölçeği büyüdükçe dar widget'ta daha az satır sığar. */
  val textScale: Float get() = scale

  companion object {
    /** Uygulama hiç açılmadıysa: Klasik palet, Çay Yeşili (src/colors.ts ile aynı; test/widgets.test.ts denetler). */
    val DEFAULT_THEME = Theme(
      mode = "system",
      light = Palette(
        bg = Color.parseColor("#FFFFFF"),
        text = Color.parseColor("#16201A"),
        muted = Color.parseColor("#5E6B63"),
        accent = Color.parseColor("#1B6B3A"),
        fill = Color.parseColor("#1B6B3A"),
        onFill = Color.WHITE,
        divider = Color.parseColor("#DCE3DE"),
      ),
      dark = Palette(
        bg = Color.parseColor("#1A201C"),
        text = Color.parseColor("#E8EDEA"),
        muted = Color.parseColor("#9AA79F"),
        accent = Color.parseColor("#4CAF73"),
        fill = Color.parseColor("#124626"),
        onFill = Color.WHITE,
        divider = Color.parseColor("#2C3530"),
      ),
    )
  }
}
