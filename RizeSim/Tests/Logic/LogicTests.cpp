// Motordan bağımsız simülasyon mantığı testleri.
// Derleme ve çalıştırma:  make -C RizeSim/Tests/Logic
//
// Unreal'a bağlı olmayan her şey burada doğrulanır; böylece çekirdek kurallar
// editör açılmadan, CI'da saniyeler içinde test edilebilir.

#include <cmath>
#include <cstdio>
#include <map>
#include <string>

#include "Sim/RizeClock.h"
#include "Sim/RizeDriving.h"
#include "Sim/RizeEconomy.h"
#include "Sim/RizeSchedule.h"
#include "Sim/RizeSolar.h"
#include "Sim/RizeWeatherModel.h"

using namespace RizeSim;

static int GFailures = 0;
static int GChecks = 0;

#define CHECK(cond)                                                                  \
	do {                                                                             \
		++GChecks;                                                                   \
		if (!(cond)) { ++GFailures; std::printf("  BAŞARISIZ %s:%d  %s\n", __FILE__, __LINE__, #cond); } \
	} while (0)

#define CHECK_NEAR(a, b, tol)                                                        \
	do {                                                                             \
		++GChecks;                                                                   \
		const double _a = (a), _b = (b);                                             \
		if (std::fabs(_a - _b) > (tol)) {                                            \
			++GFailures;                                                             \
			std::printf("  BAŞARISIZ %s:%d  %s = %.4f, beklenen %.4f ± %.4f\n",      \
			            __FILE__, __LINE__, #a, _a, _b, (double)(tol));              \
		}                                                                            \
	} while (0)

static void TestSolar()
{
	std::puts("[Güneş]");
	const FGeoReference Rize;
	const int June21 = Solar::DayOfYear(6, 21);
	const int Dec21 = Solar::DayOfYear(12, 21);

	// Öğle yüksekliği: 90 - enlem ± eksen eğikliği (23.44°)
	double MaxJune = -90, MaxDec = -90, NoonHourJune = 0;
	for (double H = 10.0; H <= 14.0; H += 1.0 / 60.0)
	{
		const FSolarAngles A = Solar::Compute(June21, H, Rize);
		if (A.ElevationDeg > MaxJune) { MaxJune = A.ElevationDeg; NoonHourJune = H; }
		MaxDec = std::fmax(MaxDec, Solar::Compute(Dec21, H, Rize).ElevationDeg);
	}
	CHECK_NEAR(MaxJune, 90.0 - 41.0201 + 23.44, 0.5);
	CHECK_NEAR(MaxDec, 90.0 - 41.0201 - 23.44, 0.5);

	// Rize UTC+3'ün merkez meridyeninin (45°D) batısında: güneş öğlesi ~12:20
	CHECK_NEAR(NoonHourJune, 12.0 + (45.0 - 40.5234) * 4.0 / 60.0 + 1.8 / 60.0, 0.05);

	// Öğlen güneş güneyde, sabah doğuda, akşam batıda
	CHECK_NEAR(Solar::Compute(June21, NoonHourJune, Rize).AzimuthDeg, 180.0, 2.0);
	CHECK(Solar::Compute(June21, 8.0, Rize).AzimuthDeg < 120.0);
	CHECK(Solar::Compute(June21, 18.0, Rize).AzimuthDeg > 240.0);

	// Haziran'da 04:30 karanlık, 05:15 güneş doğmuş; 20:00 hâlâ ufkun üstünde
	CHECK(Solar::Compute(June21, 4.5, Rize).ElevationDeg < 0.0);
	CHECK(Solar::Compute(June21, 5.25, Rize).ElevationDeg > 0.0);
	CHECK(Solar::Compute(June21, 19.75, Rize).ElevationDeg > 0.0);
	CHECK(Solar::Compute(June21, 21.0, Rize).ElevationDeg < 0.0);
	// Aralık'ta 17:00 güneş batmış
	CHECK(Solar::Compute(Dec21, 17.0, Rize).ElevationDeg < 0.0);
}

static void TestClock()
{
	std::puts("[Saat]");
	FClock C;
	CHECK(C.GetHourInt() == 7);
	CHECK(C.GetPhase() == EDayPhase::Sabah);

	// 1 gerçek dakika = 24 oyun dakikası
	const int Crossed = C.Advance(60.0 * 5); // 5 gerçek dakika = 2 oyun saati
	CHECK(Crossed == 2);
	CHECK(C.GetHourInt() == 9);

	C.SetTime(0, 23.5);
	C.Advance(60.0 * 2.5); // +1 saat → ertesi gün 00:30
	CHECK(C.GetDay() == 1);
	CHECK(C.GetHourInt() == 0);
	CHECK(C.GetMinute() == 30);
	CHECK(C.GetPhase() == EDayPhase::Gece);

	CHECK(PhaseForHour(5.5) == EDayPhase::Safak);
	CHECK(PhaseForHour(12.0) == EDayPhase::Ogle);
	CHECK(PhaseForHour(15.0) == EDayPhase::Ikindi);
	CHECK(PhaseForHour(19.0) == EDayPhase::Aksam);
	CHECK(PhaseForHour(2.0) == EDayPhase::Gece);

	CHECK_NEAR(FClock::WrapHour(-1.0), 23.0, 1e-9);
	CHECK_NEAR(FClock::WrapHour(25.0), 1.0, 1e-9);

	// Gece yarısını aşan çalışma saati (ör. 18:00–02:00 kıraathane)
	FHourRange Late{18.0, 2.0};
	CHECK(Late.Contains(23.0));
	CHECK(Late.Contains(1.0));
	CHECK(!Late.Contains(10.0));
	FHourRange Always{0.0, 0.0};
	CHECK(Always.Contains(3.0));

	// Yıl günü sarması
	C.StartDayOfYear = 365;
	C.SetTime(1, 12.0);
	CHECK(C.GetDayOfYear() == 1);
}

static void TestWeather()
{
	std::puts("[Hava]");
	// Geçiş satırları normalize
	for (int S = 0; S < FWeatherModel::N; ++S)
	{
		for (double H : {3.0, 6.0, 12.0, 19.0})
		{
			const auto Row = FWeatherModel::TransitionRow((EWeatherState)S, H, 280);
			double Sum = 0;
			for (double P : Row) { Sum += P; CHECK(P >= 0.0); }
			CHECK_NEAR(Sum, 1.0, 1e-9);
		}
	}

	// Sonbahar ilkbahardan yağışlı; sis şafakta öğlenden olası
	CHECK(FWeatherModel::SeasonRainFactor(Solar::DayOfYear(10, 15)) > FWeatherModel::SeasonRainFactor(Solar::DayOfYear(5, 1)));
	CHECK(FWeatherModel::TransitionRow(EWeatherState::Bulutlu, 6.0, 200)[(int)EWeatherState::Sis] >
	      FWeatherModel::TransitionRow(EWeatherState::Bulutlu, 13.0, 200)[(int)EWeatherState::Sis]);

	// Sağanak "aniden" bastırır: 10 oyun dakikasında yoğunluk > %80
	FWeatherModel M(42);
	M.ForceState(EWeatherState::Acik, true);
	M.ForceState(EWeatherState::Saganak, false);
	for (int i = 0; i < 600; ++i) // 600 s, 1 s adım; geçiş adımı (20 dk) gelmez
	{
		M.Tick(1.0, 14.0, 150);
	}
	CHECK(M.GetState() == EWeatherState::Saganak);
	CHECK(M.GetParams().Rain > 0.80);
	CHECK(M.GetParams().Wetness > 0.4);

	// Yağmur dinince zemin hemen kurumaz, ama saatler içinde kurur
	M.ForceState(EWeatherState::Acik, true);
	const double WetAtStop = M.GetParams().Wetness;
	FWeatherModel Dry = M;
	for (int i = 0; i < 60 * 15; ++i) Dry.Tick(1.0, 12.0, 150); // 15 dk; geçiş adımı yok
	CHECK(Dry.GetParams().Wetness < WetAtStop);
	CHECK(Dry.GetParams().Wetness > 0.5 * WetAtStop);

	// Determinizm: aynı tohum → aynı hava dizisi
	FWeatherModel A(7), B(7);
	bool bSame = true;
	for (int i = 0; i < 2000; ++i)
	{
		A.Tick(60.0, (i / 60) % 24, 280);
		B.Tick(60.0, (i / 60) % 24, 280);
		bSame &= (A.GetState() == B.GetState());
	}
	CHECK(bSame);

	// Uzun dönemde tüm durumlar görülür; hiçbiri baskın değildir (30 oyun günü)
	FWeatherModel L(99);
	std::map<int, double> Time;
	for (int Step = 0; Step < 30 * 24 * 60; ++Step)
	{
		const double Hour = (Step % (24 * 60)) / 60.0;
		L.Tick(60.0, Hour, 280);
		Time[(int)L.GetState()] += 1.0;
	}
	const double Total = 30.0 * 24 * 60;
	for (int S = 0; S < FWeatherModel::N; ++S)
	{
		const double Share = Time[S] / Total;
		std::printf("    %-8s %%%.1f\n", WeatherName((EWeatherState)S), Share * 100.0);
		CHECK(Share > 0.01);
		CHECK(Share < 0.70);
	}
}

static void TestEconomy()
{
	std::puts("[Ekonomi]");
	CHECK(FormatTL(1234) == "12,34 TL");
	CHECK(FormatTL(5) == "0,05 TL");
	CHECK(FormatTL(125000) == "1.250,00 TL");
	CHECK(FormatTL(123456789) == "1.234.567,89 TL");
	CHECK(FormatTL(-250) == "-2,50 TL");

	FCart Cart;
	FKurus Wallet = 50000; // 500 TL
	CHECK(Cart.Checkout(Wallet, true) == ECheckoutResult::EmptyCart);

	Cart.Add("cay_rize_1kg", 28500);
	Cart.Add("ekmek", 1500, 2);
	Cart.Add("ekmek", 1500);
	CHECK(Cart.CountOf("ekmek") == 3);
	CHECK(Cart.Total() == 28500 + 4500);

	CHECK(Cart.Remove("ekmek", 5) == 3);
	CHECK(Cart.CountOf("ekmek") == 0);
	CHECK(Cart.GetLines().size() == 1);

	CHECK(Cart.Checkout(Wallet, false) == ECheckoutResult::ShopClosed);
	Cart.Add("cay_rize_1kg", 28500); // toplam 570 TL > 500 TL
	CHECK(Cart.Checkout(Wallet, true) == ECheckoutResult::InsufficientFunds);
	CHECK(Wallet == 50000);
	Cart.Remove("cay_rize_1kg", 1);
	CHECK(Cart.Checkout(Wallet, true) == ECheckoutResult::Ok);
	CHECK(Wallet == 50000 - 28500);
	CHECK(Cart.IsEmpty());
}

static void TestDriving()
{
	std::puts("[Sürüş]");
	using namespace Driving;
	CHECK_NEAR(SurfaceGrip(ESurfaceType::Asfalt, 0.0, 0.0), 1.0, 1e-9);
	CHECK(SurfaceGrip(ESurfaceType::Asfalt, 1.0, 0.0) < 0.75);
	CHECK(SurfaceGrip(ESurfaceType::ArnavutKaldirimi, 1.0, 0.0) < SurfaceGrip(ESurfaceType::Asfalt, 1.0, 0.0));
	CHECK(SurfaceGrip(ESurfaceType::Asfalt, 1.0, 1.0) < SurfaceGrip(ESurfaceType::Asfalt, 1.0, 0.0));

	// 20 m yarıçaplı virajda konforlu hız ~ 7.7 m/s (~28 km/s)
	CHECK_NEAR(CornerSpeed(20.0, 1.0), std::sqrt(0.30 * 9.81 * 20.0), 1e-6);
	// Islak arnavut kaldırımında tutuş limiti konfor limitinin altına düşebilir
	CHECK(CornerSpeed(20.0, 0.30) < CornerSpeed(20.0, 1.0));

	// Dik iniş hız sınırını düşürür, çıkıştan daha çok
	CHECK(SlopeSpeedFactor(-0.15) < SlopeSpeedFactor(0.15));
	CHECK(SlopeSpeedFactor(-0.15) < 1.0);

	FSpeedPlanInput In;
	CHECK_NEAR(PlanTargetSpeed(In), 13.9, 1e-9);
	In.DistanceToStop = 0.0;
	CHECK_NEAR(PlanTargetSpeed(In), 0.0, 1e-9);
	In.DistanceToStop = 1e9;
	In.DistanceToLeader = 3.0; // MinGap altında
	CHECK_NEAR(PlanTargetSpeed(In), 0.0, 1e-9);
	In.DistanceToLeader = 30.0;
	In.LeaderSpeed = 5.0;
	const double Follow = PlanTargetSpeed(In);
	CHECK(Follow > 5.0 && Follow < 13.9);

	// Konforlu ivme
	CHECK_NEAR(StepSpeed(0.0, 10.0, 1.0), 1.5, 1e-9);
	CHECK_NEAR(StepSpeed(10.0, 0.0, 1.0), 7.5, 1e-9);
	CHECK_NEAR(StepSpeed(9.9, 10.0, 1.0), 10.0, 1e-9);
}

static void TestSchedule()
{
	std::puts("[Program]");
	FDailySchedule Esnaf;
	Esnaf.Entries.push_back({{7.5, 12.0}, "dukkan", "bakkal_tezgah", 0x3F});      // Pzt–Cmt
	Esnaf.Entries.push_back({{12.0, 13.0}, "ogle_yemegi", "esnaf_lokantasi", 0x3F});
	Esnaf.Entries.push_back({{13.0, 19.5}, "dukkan", "bakkal_tezgah", 0x3F});
	Esnaf.Entries.push_back({{19.5, 23.0}, "cay_okey", "kiraathane_masa", 0x7F});
	Esnaf.Entries.push_back({{10.0, 18.0}, "sahil_yuru", "sahil_parki", 0x40});   // Pazar

	CHECK(Esnaf.Resolve(8.0, 0) == 0);
	CHECK(Esnaf.Entries[(size_t)Esnaf.Resolve(12.5, 2)].Activity == "ogle_yemegi");
	CHECK(Esnaf.Entries[(size_t)Esnaf.Resolve(21.0, 4)].Activity == "cay_okey");
	CHECK(Esnaf.Entries[(size_t)Esnaf.Resolve(11.0, 6)].Activity == "sahil_yuru"); // Pazar dükkan kapalı
	CHECK(Esnaf.Resolve(3.0, 1) == -1); // gece evde
}

int main()
{
	TestSolar();
	TestClock();
	TestWeather();
	TestEconomy();
	TestDriving();
	TestSchedule();
	std::printf("\n%d kontrol, %d başarısız\n", GChecks, GFailures);
	return GFailures == 0 ? 0 : 1;
}
