package expo.modules.rizewidgets

import java.util.Calendar
import java.util.Locale

/**
 * Zamana bağlı Türkçe metinler. Widget her çizildiğinde yeniden hesaplanır; böylece uygulama uzun süre
 * açılmasa da "Bugün" ya da "5 dk önce" gibi yazılar eskimez (src/time.ts ve src/rizespor/format.ts
 * ile aynı biçim).
 */
object TimeText {
  private val DAYS = arrayOf("Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt")
  private val DAYS_LONG = arrayOf("Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi")
  private val MONTHS = arrayOf("Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara")

  private fun cal(ms: Long): Calendar = Calendar.getInstance().apply { timeInMillis = ms }

  /** İki an arasındaki takvim günü farkı (öğlen saatine göre: yaz saati geçişlerinden etkilenmez). */
  private fun daysBetween(from: Long, to: Long): Int {
    val a = cal(from).apply { set(Calendar.HOUR_OF_DAY, 12); set(Calendar.MINUTE, 0) }
    val b = cal(to).apply { set(Calendar.HOUR_OF_DAY, 12); set(Calendar.MINUTE, 0) }
    return Math.round((b.timeInMillis - a.timeInMillis) / 86_400_000.0).toInt()
  }

  fun clock(ms: Long): String {
    val c = cal(ms)
    // Rakamlar her dilde Latin (telefon Arapça vb. olsa da "14:05").
    return String.format(Locale.ROOT, "%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
  }

  /** "Bugün", "Yarın", "Dün" ya da "Cmt 28 Kas". */
  fun day(ms: Long, now: Long = System.currentTimeMillis()): String {
    val diff = daysBetween(now, ms)
    val c = cal(ms)
    return when (diff) {
      0 -> "Bugün"
      1 -> "Yarın"
      -1 -> "Dün"
      else -> "${DAYS[c.get(Calendar.DAY_OF_WEEK) - 1]} ${c.get(Calendar.DAY_OF_MONTH)} ${MONTHS[c.get(Calendar.MONTH)]}"
    }
  }

  /** Ekran okuyucu için: "Cumartesi 28 Kasım" yerine kısa ama açık: "Cumartesi, 28 Kas". */
  fun dayLong(ms: Long, now: Long = System.currentTimeMillis()): String {
    val short = day(ms, now)
    if (short == "Bugün" || short == "Yarın" || short == "Dün") return short
    val c = cal(ms)
    return "${DAYS_LONG[c.get(Calendar.DAY_OF_WEEK) - 1]}, ${c.get(Calendar.DAY_OF_MONTH)} ${MONTHS[c.get(Calendar.MONTH)]}"
  }

  /** "az önce", "12 dk önce", "3 sa önce", "dün", "21 Kas". */
  fun ago(ms: Long, now: Long = System.currentTimeMillis()): String {
    val minutes = (now - ms) / 60_000
    return when {
      minutes < 1 -> "az önce"
      minutes < 60 -> "$minutes dk önce"
      daysBetween(ms, now) <= 0 -> "${minutes / 60} sa önce"
      daysBetween(ms, now) == 1 -> "dün"
      else -> {
        val c = cal(ms)
        "${c.get(Calendar.DAY_OF_MONTH)} ${MONTHS[c.get(Calendar.MONTH)]}"
      }
    }
  }

  /** Verinin alındığı an: "14:05", "dün 14:05" ya da "21 Kas 14:05" (src/offline.ts savedAtLabel). */
  fun saved(ms: Long, now: Long = System.currentTimeMillis()): String {
    val days = daysBetween(ms, now)
    val c = cal(ms)
    return when {
      days <= 0 -> clock(ms)
      days == 1 -> "dün ${clock(ms)}"
      else -> "${c.get(Calendar.DAY_OF_MONTH)} ${MONTHS[c.get(Calendar.MONTH)]} ${clock(ms)}"
    }
  }

  /** Maça kalan süre (kısa): "2 gün", "5 sa", "40 dk". */
  fun until(ms: Long, now: Long = System.currentTimeMillis()): String {
    val minutes = (ms - now) / 60_000
    return when {
      minutes < 60 -> "${minutes.coerceAtLeast(1)} dk"
      minutes < 48 * 60 -> "${minutes / 60} sa"
      else -> "${minutes / (24 * 60)} gün"
    }
  }
}
