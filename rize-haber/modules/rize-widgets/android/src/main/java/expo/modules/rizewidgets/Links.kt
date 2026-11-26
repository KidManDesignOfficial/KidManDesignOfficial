package expo.modules.rizewidgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri

/**
 * Widget'a ve kısayollara dokununca uygulamayı istenen sekmede açan bağlantılar:
 * `rizehaber://open?tab=weather` ya da `rizehaber://open?tab=news&url=<haber>` (src/widgets/links.ts).
 *
 * Intent açık (explicit) olarak uygulamanın kendi ana etkinliğine gider; başka bir uygulama bu
 * bağlantıyı yakalayamaz ve manifestte ayrıca bir şema tanımlamak gerekmez.
 */
object Links {
  const val SCHEME = "rizehaber"
  const val HOST = "open"

  fun uri(tab: String, url: String? = null): Uri =
    Uri.Builder()
      .scheme(SCHEME)
      .authority(HOST)
      .appendQueryParameter("tab", tab)
      .apply { if (url != null) appendQueryParameter("url", url) }
      .build()

  fun intent(context: Context, tab: String, url: String? = null): Intent {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    return Intent(Intent.ACTION_VIEW, uri(tab, url)).apply {
      component = launch?.component
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
  }

  /**
   * @param requestCode Widget türü ve dokunma noktası başına benzersiz; aynı widget'taki farklı
   *   haber satırları birbirinin bağlantısını ezmesin.
   */
  fun pending(context: Context, requestCode: Int, tab: String, url: String? = null): PendingIntent =
    PendingIntent.getActivity(
      context,
      requestCode,
      intent(context, tab, url),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
}
