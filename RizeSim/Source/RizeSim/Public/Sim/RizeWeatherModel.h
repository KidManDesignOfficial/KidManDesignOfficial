// Rize Yaşam Simülasyonu — Hava durumu modeli (motordan bağımsız)
//
// Karadeniz'e özgü davranış:
//   * Yağmur yıl boyu vardır; sonbahar (Eyl–Kas) en yağışlı dönemdir.
//   * Sağanak "aniden bastırır": Bulutlu → Sağanak doğrudan geçiş vardır ve
//     yağmur yoğunluğu birkaç oyun dakikasında tepe değere çıkar.
//   * Sis dağlardan yavaş süzülür; şafakta ve akşamüstü daha olasıdır.
//   * Islaklık (asfalt yansımaları) ve su birikintileri yağmurdan ayrı,
//     kendi hızlarında birikip kurur — yağmur dinse de sokak bir süre ıslak kalır.
//
// Durumlar arası geçiş, oyun saatiyle 20 dakikada bir değerlendirilen bir
// Markov zinciridir. RNG deterministiktir (aynı tohum = aynı hava), bu da
// test, tekrar oynatma ve kayıt/yükleme için önemlidir.

#pragma once

#include <array>
#include <cmath>
#include <cstdint>

namespace RizeSim
{
	enum class EWeatherState : uint8_t
	{
		Acik = 0,  // Açık / parçalı güneşli
		Bulutlu,   // Kapalı, ağır bulutlar
		Cisenti,   // Çiseleyen yağmur
		Saganak,   // Karadeniz sağanağı
		Sis,       // Yoğun sis
		Count
	};

	inline const char* WeatherName(EWeatherState S)
	{
		switch (S)
		{
		case EWeatherState::Acik:    return "Açık";
		case EWeatherState::Bulutlu: return "Bulutlu";
		case EWeatherState::Cisenti: return "Çisenti";
		case EWeatherState::Saganak: return "Sağanak";
		case EWeatherState::Sis:     return "Sis";
		default:                     return "?";
		}
	}

	/** Görsel/işitsel sistemlere aktarılan sürekli (0..1) değerler. */
	struct FWeatherParams
	{
		double Rain = 0.0;     // Yağış yoğunluğu (Niagara spawn, ses)
		double Fog = 0.02;     // Sis yoğunluğu (ExponentialHeightFog + volumetrik)
		double Cloud = 0.2;    // Bulut örtüsü (gökyüzü, güneş ışığı şiddeti)
		double Wind = 0.2;     // Rüzgar (yağmur açısı, ağaç sallanması)
		double Wetness = 0.0;  // Yüzey ıslaklığı (malzeme pürüzlülüğü → Lumen yansıması)
		double Puddles = 0.0;  // Su birikintileri (çukurlarda ayna gibi yansıma)
	};

	/** Deterministik, hızlı RNG (xorshift64*). */
	class FRng
	{
	public:
		explicit FRng(uint64_t Seed = 0x52495A45ull /* "RIZE" */) : State(Seed ? Seed : 1ull) {}
		uint64_t Next()
		{
			State ^= State >> 12;
			State ^= State << 25;
			State ^= State >> 27;
			return State * 2685821657736338717ull;
		}
		double NextUnit() { return (double)(Next() >> 11) * (1.0 / 9007199254740992.0); }
		uint64_t GetState() const { return State; }
		void SetState(uint64_t S) { State = S ? S : 1ull; }
	private:
		uint64_t State;
	};

	class FWeatherModel
	{
	public:
		static constexpr int N = (int)EWeatherState::Count;
		static constexpr double StepSeconds = 20.0 * 60.0; // 20 oyun dakikası
		using FRow = std::array<double, N>;

		explicit FWeatherModel(uint64_t Seed = 0x52495A45ull) : Rng(Seed) {}

		EWeatherState GetState() const { return State; }
		const FWeatherParams& GetParams() const { return Params; }
		double GetSecondsInState() const { return SecondsInState; }
		FRng& GetRng() { return Rng; }
		const FRng& GetRng() const { return Rng; }

		/** Yönetmen/hata ayıklama komutu: havayı zorla değiştir. */
		void ForceState(EWeatherState S, bool bInstant)
		{
			State = S;
			SecondsInState = 0.0;
			if (bInstant)
			{
				const FWeatherParams T = TargetFor(S);
				Params.Rain = T.Rain; Params.Fog = T.Fog; Params.Cloud = T.Cloud; Params.Wind = T.Wind;
			}
		}

		/** Ay (1..12) için yağış çarpanı. Rize aylık yağış ortalamalarının yaklaşık oranları. */
		static double SeasonRainFactor(int DayOfYear)
		{
			// Yaklaşık aylık yağış (mm), Oca..Ara — oransal kullanılır, mutlak değer değil.
			static const double Monthly[12] = {220, 180, 160, 95, 95, 135, 150, 190, 260, 300, 250, 240};
			int Month = (int)((DayOfYear - 1) / 30.5) + 1;
			Month = Month < 1 ? 1 : (Month > 12 ? 12 : Month);
			return Monthly[Month - 1] / 190.0;
		}

		/** Saate göre sis çarpanı: şafakta yüksek, öğlen düşük. */
		static double FogHourFactor(double Hour)
		{
			if (Hour >= 4.0 && Hour < 9.0)   return 3.0;
			if (Hour >= 18.0 && Hour < 22.0) return 1.5;
			if (Hour >= 11.0 && Hour < 16.0) return 0.4;
			return 1.0;
		}

		/** Bir durumdan diğerlerine 20 dakikalık geçiş olasılıkları (normalize edilmiş). */
		static FRow TransitionRow(EWeatherState From, double Hour, int DayOfYear)
		{
			// Sıra: Açık, Bulutlu, Çisenti, Sağanak, Sis
			static const double Base[N][N] = {
				/* Açık    */ {0.930, 0.060, 0.000, 0.000, 0.010},
				/* Bulutlu */ {0.060, 0.850, 0.060, 0.015, 0.015},
				/* Çisenti */ {0.000, 0.070, 0.820, 0.080, 0.030},
				/* Sağanak */ {0.000, 0.050, 0.170, 0.780, 0.000},
				/* Sis     */ {0.030, 0.080, 0.030, 0.000, 0.860},
			};
			const double Season = SeasonRainFactor(DayOfYear);
			const double FogF = FogHourFactor(Hour);
			const int F = (int)From;

			FRow Row{};
			double Sum = 0.0;
			for (int To = 0; To < N; ++To)
			{
				double W = Base[F][To];
				if (To != F)
				{
					if (To == (int)EWeatherState::Cisenti || To == (int)EWeatherState::Saganak) W *= Season;
					if (To == (int)EWeatherState::Sis) W *= FogF;
				}
				Row[To] = W;
				Sum += W;
			}
			for (double& W : Row) W /= Sum;
			return Row;
		}

		static FWeatherParams TargetFor(EWeatherState S)
		{
			FWeatherParams T;
			switch (S)
			{
			case EWeatherState::Acik:    T.Rain = 0.00; T.Fog = 0.02; T.Cloud = 0.20; T.Wind = 0.20; break;
			case EWeatherState::Bulutlu: T.Rain = 0.00; T.Fog = 0.08; T.Cloud = 0.75; T.Wind = 0.35; break;
			case EWeatherState::Cisenti: T.Rain = 0.25; T.Fog = 0.15; T.Cloud = 0.90; T.Wind = 0.30; break;
			case EWeatherState::Saganak: T.Rain = 1.00; T.Fog = 0.25; T.Cloud = 1.00; T.Wind = 0.60; break;
			case EWeatherState::Sis:     T.Rain = 0.00; T.Fog = 0.85; T.Cloud = 0.60; T.Wind = 0.05; break;
			default: break;
			}
			return T;
		}

		/**
		 * @param GameDeltaSeconds Oyun saniyesi (gerçek değil; TimeScale uygulanmış)
		 * @param Hour             0..24 yerel saat
		 * @param DayOfYear        1..365
		 */
		void Tick(double GameDeltaSeconds, double Hour, int DayOfYear)
		{
			if (GameDeltaSeconds <= 0.0) return;

			// 1) Ayrık durum geçişleri (sabit adımlarla; kare hızından bağımsız)
			StepAccumulator += GameDeltaSeconds;
			while (StepAccumulator >= StepSeconds)
			{
				StepAccumulator -= StepSeconds;
				const FRow Row = TransitionRow(State, Hour, DayOfYear);
				const double R = Rng.NextUnit();
				double Acc = 0.0;
				for (int To = 0; To < N; ++To)
				{
					Acc += Row[To];
					if (R < Acc)
					{
						if (To != (int)State) { State = (EWeatherState)To; SecondsInState = 0.0; }
						break;
					}
				}
			}
			SecondsInState += GameDeltaSeconds;

			// 2) Sürekli parametreleri hedefe yaklaştır (üstel yumuşatma, oyun saati başına hız)
			const double Hours = GameDeltaSeconds / 3600.0;
			const FWeatherParams T = TargetFor(State);
			const double RainRate = (T.Rain > Params.Rain && State == EWeatherState::Saganak) ? 12.0 : 3.0; // aniden bastırır
			Params.Rain  = Approach(Params.Rain,  T.Rain,  RainRate, Hours);
			Params.Fog   = Approach(Params.Fog,   T.Fog,   1.5, Hours); // sis yavaş süzülür
			Params.Cloud = Approach(Params.Cloud, T.Cloud, 2.0, Hours);
			Params.Wind  = Approach(Params.Wind,  T.Wind,  3.0, Hours);

			// 3) Islaklık ve birikinti: yağışla dolar, güneş/rüzgarla yavaşça kurur
			const bool bDaylight = Hour >= 8.0 && Hour < 18.0;
			const double Sun = bDaylight ? (1.0 - Params.Cloud) : 0.0;
			const double DryRate = 0.15 + 0.35 * Sun + 0.20 * Params.Wind; // saat başına
			if (Params.Rain > 0.05)
			{
				Params.Wetness += Params.Rain * 6.0 * (1.0 - Params.Wetness) * Hours;
				const double Heavy = Params.Rain - 0.30;
				if (Heavy > 0.0) Params.Puddles += Heavy * 1.5 * (1.0 - Params.Puddles) * Hours;
			}
			else
			{
				Params.Wetness -= DryRate * Params.Wetness * Hours;
				Params.Puddles -= 0.5 * DryRate * Params.Puddles * Hours;
			}
			Params.Wetness = Clamp01(Params.Wetness);
			Params.Puddles = Clamp01(Params.Puddles);
		}

	private:
		static double Clamp01(double V) { return V < 0.0 ? 0.0 : (V > 1.0 ? 1.0 : V); }
		static double Approach(double Current, double Target, double RatePerHour, double Hours)
		{
			const double Alpha = 1.0 - std::exp(-RatePerHour * Hours);
			return Current + (Target - Current) * Alpha;
		}

		FRng Rng;
		EWeatherState State = EWeatherState::Bulutlu;
		FWeatherParams Params;
		double StepAccumulator = 0.0;
		double SecondsInState = 0.0;
	};
}
