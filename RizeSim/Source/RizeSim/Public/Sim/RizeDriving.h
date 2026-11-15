// Rize Yaşam Simülasyonu — Sürüş ve hız planlama mantığı (motordan bağımsız)
//
// İki tüketicisi var:
//   1) Oyuncunun sürdüğü Chaos araç: zemin tutuşu (ıslaklık + zemin tipi) →
//      tekerlek sürtünme çarpanı.
//   2) Yapay zeka araçları (akan trafik, dolmuşlar): spline üzerinde hedef hız
//      planlama — viraj yarıçapı, eğim, durak/ışık mesafesi, öndeki araç.

#pragma once

#include <algorithm>
#include <cmath>

namespace RizeSim
{
	enum class ESurfaceType : unsigned char
	{
		Asfalt,
		ArnavutKaldirimi, // eski mahalle sokakları
		Beton,            // dik köy yolları, rampalar
		Toprak            // yayla yolları
	};

	namespace Driving
	{
		constexpr double Gravity = 9.81;

		/** Kuru = 1.0 referanslı tutuş çarpanı. Islak yamaçlarda araç gerçekten kayar. */
		inline double SurfaceGrip(ESurfaceType Surface, double Wetness, double Puddles)
		{
			double Dry = 1.0, Wet = 0.70;
			switch (Surface)
			{
			case ESurfaceType::Asfalt:           Dry = 1.00; Wet = 0.70; break;
			case ESurfaceType::ArnavutKaldirimi: Dry = 0.85; Wet = 0.50; break;
			case ESurfaceType::Beton:            Dry = 0.95; Wet = 0.65; break;
			case ESurfaceType::Toprak:           Dry = 0.70; Wet = 0.40; break;
			}
			Wetness = std::clamp(Wetness, 0.0, 1.0);
			Puddles = std::clamp(Puddles, 0.0, 1.0);
			const double Grip = Dry + (Wet - Dry) * Wetness;
			return Grip * (1.0 - 0.25 * Puddles); // birikintide kızaklama riski
		}

		/**
		 * Konforlu viraj hızı (m/s). Dolmuş yolcuyu savurmasın diye yanal ivme sınırı
		 * fiziksel limitin altında tutulur: v = sqrt(a_lat * r).
		 */
		inline double CornerSpeed(double RadiusMeters, double Grip, double ComfortLateralG = 0.30)
		{
			if (RadiusMeters <= 0.0 || !std::isfinite(RadiusMeters)) return 1e9; // düz yol
			const double ALat = std::min(ComfortLateralG, 0.8 * Grip) * Gravity;
			return std::sqrt(ALat * RadiusMeters);
		}

		/** Yokuş aşağı dik eğimde hız sınırı düşer (eğim %: 0.15 = %15). */
		inline double SlopeSpeedFactor(double GradeSigned)
		{
			// Negatif = iniş. %20 inişte hız ~%60'a iner. Çıkışta motor zaten zorlanır.
			if (GradeSigned >= 0.0) return 1.0 - std::min(GradeSigned, 0.25) * 1.2;
			return 1.0 - std::min(-GradeSigned, 0.25) * 2.0;
		}

		/** Mesafe içinde durabilmek için izin verilen azami hız: v = sqrt(2 a d). */
		inline double StoppingSpeed(double DistanceMeters, double Grip, double ComfortDecel = 2.0)
		{
			if (DistanceMeters <= 0.0) return 0.0;
			const double A = std::min(ComfortDecel, 0.7 * Grip * Gravity);
			return std::sqrt(2.0 * A * DistanceMeters);
		}

		struct FSpeedPlanInput
		{
			double SpeedLimit = 13.9;          // m/s (50 km/s şehir içi)
			double LookaheadRadius = 1e9;      // ileri bakıştaki en dar viraj yarıçapı (m)
			double Grade = 0.0;                // işaretli eğim
			double DistanceToStop = 1e9;       // durak / kırmızı ışık / yaya geçidi (m)
			double DistanceToLeader = 1e9;     // öndeki araca kalan boşluk (m)
			double LeaderSpeed = 1e9;          // öndeki aracın hızı (m/s)
			double Grip = 1.0;
			double MinGap = 4.0;               // durunca bırakılan mesafe (m)
			double TimeHeadway = 1.5;          // takip süresi (s)
		};

		/** Tüm kısıtların en küçüğü = hedef hız. */
		inline double PlanTargetSpeed(const FSpeedPlanInput& In)
		{
			double V = In.SpeedLimit * SlopeSpeedFactor(In.Grade);
			V = std::min(V, CornerSpeed(In.LookaheadRadius, In.Grip));
			V = std::min(V, StoppingSpeed(In.DistanceToStop, In.Grip));

			// Takip: serbest boşluk içinde öndekinin hızına inebilmeli → v² ≤ vL² + 2·a·boşluk,
			// ayrıca zaman aralığı kuralı: boşluk ≥ MinGap + Headway·v
			const double FreeGap = In.DistanceToLeader - In.MinGap;
			if (FreeGap <= 0.0) return 0.0;
			const double LeaderV = std::clamp(In.LeaderSpeed, 0.0, 1e3);
			const double Decel = std::min(2.0, 0.7 * In.Grip * Gravity);
			const double FollowCap = std::min(std::sqrt(LeaderV * LeaderV + 2.0 * Decel * FreeGap),
			                                  FreeGap / In.TimeHeadway);
			V = std::min(V, FollowCap);
			return std::max(0.0, V);
		}

		/** Hedef hıza konforlu ivme/frenle yaklaş (yolcu dolmuşta sarsılmasın). */
		inline double StepSpeed(double Current, double Target, double Dt, double Accel = 1.5, double Decel = 2.5)
		{
			if (Target > Current) return std::min(Target, Current + Accel * Dt);
			return std::max(Target, Current - Decel * Dt);
		}
	}
}
