// Rize Yaşam Simülasyonu — Güneş konumu hesabı (motordan bağımsız)
//
// NOAA "General Solar Position Calculations" yaklaşımı. Gün-yılı, yerel saat,
// enlem/boylam ve saat dilimine göre güneşin yükseklik (elevation) ve azimut
// açılarını verir. Böylece Rize'de 21 Haziran'da güneşin gerçekten ~05:30'da
// doğup ~20:40'ta batması, Aralık'ta ise öğlen bile alçak kalması sağlanır.
//
// Bu dosya Unreal'a bağımlı değildir; Tests/Logic altında g++ ile test edilir.

#pragma once

#include <cmath>

namespace RizeSim
{
	/** Rize merkez (Cumhuriyet Meydanı civarı) referans koordinatları. */
	struct FGeoReference
	{
		double LatitudeDeg = 41.0201;
		double LongitudeDeg = 40.5234;
		double UtcOffsetHours = 3.0; // Türkiye: sabit UTC+3 (2016'dan beri yaz saati yok)
	};

	struct FSolarAngles
	{
		double ElevationDeg = 0.0; // Ufkun üstünde +, altında -
		double AzimuthDeg = 0.0;   // Kuzeyden saat yönünde: 0=K, 90=D, 180=G, 270=B
	};

	namespace Solar
	{
		constexpr double Pi = 3.14159265358979323846;
		inline double DegToRad(double D) { return D * Pi / 180.0; }
		inline double RadToDeg(double R) { return R * 180.0 / Pi; }

		/**
		 * @param DayOfYear   1..366
		 * @param LocalHour   0..24 (ondalıklı; 13.5 = 13:30)
		 */
		inline FSolarAngles Compute(int DayOfYear, double LocalHour, const FGeoReference& Geo)
		{
			// Kesirli yıl (radyan)
			const double Gamma = 2.0 * Pi / 365.0 * (DayOfYear - 1 + (LocalHour - 12.0) / 24.0);

			// Zaman denklemi (dakika) ve güneş deklinasyonu (radyan)
			const double EqTime = 229.18 * (0.000075 + 0.001868 * std::cos(Gamma) - 0.032077 * std::sin(Gamma)
				- 0.014615 * std::cos(2 * Gamma) - 0.040849 * std::sin(2 * Gamma));
			const double Decl = 0.006918 - 0.399912 * std::cos(Gamma) + 0.070257 * std::sin(Gamma)
				- 0.006758 * std::cos(2 * Gamma) + 0.000907 * std::sin(2 * Gamma)
				- 0.002697 * std::cos(3 * Gamma) + 0.00148 * std::sin(3 * Gamma);

			// Gerçek güneş zamanı (dakika) ve saat açısı
			const double TimeOffset = EqTime + 4.0 * Geo.LongitudeDeg - 60.0 * Geo.UtcOffsetHours;
			const double TrueSolarMinutes = LocalHour * 60.0 + TimeOffset;
			const double HourAngle = DegToRad(TrueSolarMinutes / 4.0 - 180.0);

			const double Lat = DegToRad(Geo.LatitudeDeg);
			double CosZenith = std::sin(Lat) * std::sin(Decl) + std::cos(Lat) * std::cos(Decl) * std::cos(HourAngle);
			CosZenith = CosZenith > 1.0 ? 1.0 : (CosZenith < -1.0 ? -1.0 : CosZenith);
			const double Zenith = std::acos(CosZenith);

			FSolarAngles Out;
			Out.ElevationDeg = 90.0 - RadToDeg(Zenith);

			// Azimut: kuzeyden saat yönünde
			const double SinZenith = std::sin(Zenith);
			if (SinZenith < 1e-9)
			{
				Out.AzimuthDeg = 180.0;
				return Out;
			}
			double CosAz = (std::sin(Decl) - std::sin(Lat) * CosZenith) / (std::cos(Lat) * SinZenith);
			CosAz = CosAz > 1.0 ? 1.0 : (CosAz < -1.0 ? -1.0 : CosAz);
			double Az = RadToDeg(std::acos(CosAz)); // 0..180, öğleden önce doğu tarafı
			if (HourAngle > 0.0)
			{
				Az = 360.0 - Az; // öğleden sonra batı tarafı
			}
			Out.AzimuthDeg = Az;
			return Out;
		}

		/** Ay ve gün → gün-yılı (artık yıl hesaba katılmaz; simülasyon için yeterli). */
		inline int DayOfYear(int Month, int Day)
		{
			static const int Cumulative[12] = {0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334};
			if (Month < 1) Month = 1;
			if (Month > 12) Month = 12;
			return Cumulative[Month - 1] + Day;
		}
	}
}
