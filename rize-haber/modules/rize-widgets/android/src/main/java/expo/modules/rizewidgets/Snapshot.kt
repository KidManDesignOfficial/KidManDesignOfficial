package expo.modules.rizewidgets

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Uygulamanın ürettiği veri anlık görüntüsü (src/widgets/snapshot.ts ile aynı şema).
 *
 * JSON, SharedPreferences'ta tek bir metin olarak saklanır. Okuma hatası ya da tanınmayan şema
 * sürümü widget'ı çökertmez: `null` döner ve widget "Uygulamayı açın" yazısını gösterir.
 */
const val SNAPSHOT_VERSION = 1

/** Widget türleri; JS'teki WidgetKind ile aynı adlar. */
object Kinds {
  const val WEATHER = "weather"
  const val NEWS = "news"
  const val MARKETS = "markets"
  const val RIZESPOR = "rizespor"
  const val SHORTCUTS = "shortcuts"
}

data class Palette(
  val bg: Int,
  val text: Int,
  val muted: Int,
  val accent: Int,
  val fill: Int,
  val onFill: Int,
  val divider: Int,
)

data class Theme(val mode: String, val light: Palette, val dark: Palette)

data class Hour(val time: String, val temp: String, val icon: String)

data class WeatherData(
  val place: String,
  val temp: String,
  val label: String,
  val icon: String,
  val hiLo: String?,
  val detail: String,
  val hours: List<Hour>,
  val a11y: String,
  val savedAt: Long,
)

data class NewsRow(val title: String, val source: String, val publishedAt: Long?, val url: String)

data class NewsData(val items: List<NewsRow>, val savedAt: Long)

data class MarketRow(val code: String, val label: String, val value: String)

data class MarketsData(val rows: List<MarketRow>, val tea: String?, val date: String?, val a11y: String, val savedAt: Long)

data class MatchData(
  val state: String,
  val home: String,
  val away: String,
  val score: String?,
  val status: String,
  val kickoff: Long,
  val venue: String?,
  val rizesporHome: Boolean,
  val result: String?,
  val savedAt: Long,
)

data class Snapshot(
  val savedAt: Long,
  val textScale: Float,
  val theme: Theme,
  val weather: WeatherData?,
  val news: NewsData?,
  val markets: MarketsData?,
  val rizespor: MatchData?,
)

object SnapshotStore {
  private const val PREFS = "rize_widgets"
  private const val KEY = "snapshot"

  fun write(context: Context, json: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
  }

  fun read(context: Context): Snapshot? {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null) ?: return null
    return try {
      parse(JSONObject(raw))
    } catch (e: Exception) {
      null
    }
  }

  fun parse(o: JSONObject): Snapshot? {
    if (o.optInt("v") != SNAPSHOT_VERSION) return null
    val theme = o.optJSONObject("theme") ?: return null
    return Snapshot(
      savedAt = o.optLong("savedAt"),
      textScale = o.optDouble("textScale", 1.0).toFloat().coerceIn(0.8f, 1.6f),
      theme = Theme(
        mode = theme.optString("mode", "system"),
        light = palette(theme.getJSONObject("light")),
        dark = palette(theme.getJSONObject("dark")),
      ),
      weather = o.optJSONObject("weather")?.let(::weather),
      news = o.optJSONObject("news")?.let(::news),
      markets = o.optJSONObject("markets")?.let(::markets),
      rizespor = o.optJSONObject("rizespor")?.let(::match),
    )
  }

  private fun color(o: JSONObject, key: String): Int = android.graphics.Color.parseColor(o.getString(key))

  private fun palette(o: JSONObject) = Palette(
    bg = color(o, "bg"),
    text = color(o, "text"),
    muted = color(o, "muted"),
    accent = color(o, "accent"),
    fill = color(o, "fill"),
    onFill = color(o, "onFill"),
    divider = color(o, "divider"),
  )

  /** JSON'daki `null` değerini Kotlin'de de null yapar (optString "null" metnini döndürür). */
  private fun JSONObject.str(key: String): String? = if (isNull(key)) null else optString(key)

  private fun JSONObject.long(key: String): Long? = if (isNull(key)) null else optLong(key)

  private inline fun <T> JSONArray?.map(f: (JSONObject) -> T): List<T> {
    if (this == null) return emptyList()
    return (0 until length()).mapNotNull { i -> optJSONObject(i)?.let(f) }
  }

  private fun weather(o: JSONObject) = WeatherData(
    place = o.optString("place"),
    temp = o.optString("temp"),
    label = o.optString("label"),
    icon = o.optString("icon", "cloudy"),
    hiLo = o.str("hiLo"),
    detail = o.optString("detail"),
    hours = o.optJSONArray("hours").map { Hour(it.optString("time"), it.optString("temp"), it.optString("icon", "cloudy")) },
    a11y = o.optString("a11y"),
    savedAt = o.optLong("savedAt"),
  )

  private fun news(o: JSONObject) = NewsData(
    items = o.optJSONArray("items").map { NewsRow(it.optString("title"), it.optString("source"), it.long("publishedAt"), it.optString("url")) },
    savedAt = o.optLong("savedAt"),
  )

  private fun markets(o: JSONObject) = MarketsData(
    rows = o.optJSONArray("rows").map { MarketRow(it.optString("code"), it.optString("label"), it.optString("value")) },
    tea = o.str("tea"),
    date = o.str("date"),
    a11y = o.optString("a11y"),
    savedAt = o.optLong("savedAt"),
  )

  private fun match(o: JSONObject) = MatchData(
    state = o.optString("state", "pre"),
    home = o.optString("home"),
    away = o.optString("away"),
    score = o.str("score"),
    status = o.optString("status"),
    kickoff = o.optLong("kickoff"),
    venue = o.str("venue"),
    rizesporHome = o.optBoolean("rizesporHome", true),
    result = o.str("result"),
    savedAt = o.optLong("savedAt"),
  )
}
