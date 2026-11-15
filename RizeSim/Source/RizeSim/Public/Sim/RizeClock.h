// Rize Yaşam Simülasyonu — Oyun saati (motordan bağımsız)
//
// 24 saatlik döngünün tek doğruluk kaynağı. Unreal tarafında URizeTimeSubsystem
// bunu sarar; ışık, hava, NPC programları, dükkan açılış saatleri ve dolmuş
// seferleri hep bu saate bakar.

#pragma once

#include <cmath>
#include <cstdint>

namespace RizeSim
{
	/** Günün dilimleri. Atmosfer, ses ve kalabalık yoğunluğu buna göre değişir. */
	enum class EDayPhase : uint8_t
	{
		Safak,   // 05:00–07:00  Sis dağların ardında, ilk ezan, fırın ışıkları
		Sabah,   // 07:00–11:00  Kepenkler açılır, simit, işe yetişen kalabalık
		Ogle,    // 11:00–14:00  Çarşının en canlı ve gürültülü saatleri
		Ikindi,  // 14:00–17:00  Çay saati, tempo yavaşlar
		Aksam,   // 17:00–21:00  Sahil yürüyüşü, kıraathaneler dolar
		Gece     // 21:00–05:00  Yamaçlarda ışıklar, sokak lambaları, sessizlik
	};

	inline const char* PhaseName(EDayPhase P)
	{
		switch (P)
		{
		case EDayPhase::Safak:  return "Şafak";
		case EDayPhase::Sabah:  return "Sabah";
		case EDayPhase::Ogle:   return "Öğle";
		case EDayPhase::Ikindi: return "İkindi";
		case EDayPhase::Aksam:  return "Akşam";
		default:                return "Gece";
		}
	}

	inline EDayPhase PhaseForHour(double Hour)
	{
		if (Hour >= 5.0 && Hour < 7.0)   return EDayPhase::Safak;
		if (Hour >= 7.0 && Hour < 11.0)  return EDayPhase::Sabah;
		if (Hour >= 11.0 && Hour < 14.0) return EDayPhase::Ogle;
		if (Hour >= 14.0 && Hour < 17.0) return EDayPhase::Ikindi;
		if (Hour >= 17.0 && Hour < 21.0) return EDayPhase::Aksam;
		return EDayPhase::Gece;
	}

	/** Bir saat aralığı; gece yarısını aşan aralıkları da destekler (örn. 22:00–02:00). */
	struct FHourRange
	{
		double Open = 8.0;
		double Close = 20.0;

		bool Contains(double Hour) const
		{
			if (Open == Close) return true; // 24 saat açık
			if (Open < Close)  return Hour >= Open && Hour < Close;
			return Hour >= Open || Hour < Close; // gece yarısını aşıyor
		}
	};

	class FClock
	{
	public:
		static constexpr double SecondsPerDay = 86400.0;

		/** Varsayılan: 1 oyun günü = 60 gerçek dakika. Sakin tempo için bilinçli seçim. */
		double TimeScale = 24.0;

		void SetTime(int InDay, double InHour)
		{
			TotalSeconds = (double)InDay * SecondsPerDay + WrapHour(InHour) * 3600.0;
		}

		/** Gerçek zaman ilerletir; geçilen tam saat sayısını döndürür (olay tetiklemek için). */
		int Advance(double RealDeltaSeconds)
		{
			if (RealDeltaSeconds <= 0.0 || TimeScale <= 0.0) return 0;
			const int64_t HourBefore = (int64_t)std::floor(TotalSeconds / 3600.0);
			TotalSeconds += RealDeltaSeconds * TimeScale;
			const int64_t HourAfter = (int64_t)std::floor(TotalSeconds / 3600.0);
			return (int)(HourAfter - HourBefore);
		}

		double GetTotalSeconds() const { return TotalSeconds; }
		int GetDay() const { return (int)std::floor(TotalSeconds / SecondsPerDay); }
		double GetHour() const { return std::fmod(TotalSeconds, SecondsPerDay) / 3600.0; }
		int GetHourInt() const { return (int)std::floor(GetHour()); }
		int GetMinute() const { return (int)std::floor(std::fmod(TotalSeconds, 3600.0) / 60.0); }
		EDayPhase GetPhase() const { return PhaseForHour(GetHour()); }

		/** Yıl içi gün (1..365): oyun 1. günü = StartDayOfYear. Güneş açısı ve mevsim için. */
		int StartDayOfYear = 135; // 15 Mayıs: Rize'de ilk hasat çayı mevsimi
		int GetDayOfYear() const { return ((StartDayOfYear - 1 + GetDay()) % 365 + 365) % 365 + 1; }

		static double WrapHour(double H)
		{
			H = std::fmod(H, 24.0);
			return H < 0.0 ? H + 24.0 : H;
		}

	private:
		double TotalSeconds = 7.0 * 3600.0; // Oyun 1. gün sabah 07:00'de başlar
	};
}
