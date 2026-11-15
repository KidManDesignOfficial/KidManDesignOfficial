// Rize Yaşam Simülasyonu — NPC günlük programı (motordan bağımsız)
//
// Her NPC'nin bir günü vardır: esnaf sabah kepenk açar, öğlen lokantaya gider,
// akşam kıraathaneye uğrar. Program saat aralıklarından oluşur; ilk eşleşen
// kayıt geçerlidir. Hiçbiri eşleşmezse NPC "ev"dedir (dünyadan çekilir).

#pragma once

#include <string>
#include <vector>

#include "RizeClock.h"

namespace RizeSim
{
	struct FScheduleEntry
	{
		FHourRange Hours;
		std::string Activity;    // örn. "dukkan_ac", "cay_ic", "sahil_yuru"
		std::string LocationTag; // dünyadaki hedef nokta etiketi
		int Weekdays = 0x7F;     // bit maskesi: bit0 = Pazartesi … bit6 = Pazar
	};

	class FDailySchedule
	{
	public:
		std::vector<FScheduleEntry> Entries;

		/** Geçerli kaydın indeksini döndürür; yoksa -1 (evde). DayIndex 0 = Pazartesi. */
		int Resolve(double Hour, int DayIndex = 0) const
		{
			const int Bit = 1 << (((DayIndex % 7) + 7) % 7);
			for (size_t i = 0; i < Entries.size(); ++i)
			{
				if ((Entries[i].Weekdays & Bit) && Entries[i].Hours.Contains(Hour)) return (int)i;
			}
			return -1;
		}
	};
}
