// Blueprint'e açılan ortak tipler. Motordan bağımsız Sim/ tiplerinin UENUM aynalarıdır;
// sıralamaları birebir aynı tutulur (static_assert ile korunur).

#pragma once

#include "CoreMinimal.h"

#include <string>

#include "Sim/RizeClock.h"
#include "Sim/RizeDriving.h"
#include "Sim/RizeWeatherModel.h"
#include "RizeTypes.generated.h"

UENUM(BlueprintType)
enum class ERizeDayPhase : uint8
{
	Safak  UMETA(DisplayName = "Şafak"),
	Sabah  UMETA(DisplayName = "Sabah"),
	Ogle   UMETA(DisplayName = "Öğle"),
	Ikindi UMETA(DisplayName = "İkindi"),
	Aksam  UMETA(DisplayName = "Akşam"),
	Gece   UMETA(DisplayName = "Gece")
};

UENUM(BlueprintType)
enum class ERizeWeather : uint8
{
	Acik    UMETA(DisplayName = "Açık"),
	Bulutlu UMETA(DisplayName = "Bulutlu"),
	Cisenti UMETA(DisplayName = "Çisenti"),
	Saganak UMETA(DisplayName = "Sağanak"),
	Sis     UMETA(DisplayName = "Sis")
};

UENUM(BlueprintType)
enum class ERizeSurface : uint8
{
	Asfalt           UMETA(DisplayName = "Asfalt"),
	ArnavutKaldirimi UMETA(DisplayName = "Arnavut Kaldırımı"),
	Beton            UMETA(DisplayName = "Beton"),
	Toprak           UMETA(DisplayName = "Toprak")
};

/** Oyuncunun yaşam alanı seçimi (oyun başında). */
UENUM(BlueprintType)
enum class ERizeHome : uint8
{
	SahilDairesi  UMETA(DisplayName = "Sahil Dairesi"),
	MahalleEvi    UMETA(DisplayName = "Yokuşlu Mahalle Evi"),
	YaylaEvi      UMETA(DisplayName = "Yayla Evi")
};

static_assert((uint8)ERizeDayPhase::Gece == (uint8)RizeSim::EDayPhase::Gece, "Faz sıralaması uyumsuz");
static_assert((uint8)ERizeWeather::Sis == (uint8)RizeSim::EWeatherState::Sis, "Hava sıralaması uyumsuz");
static_assert((uint8)ERizeSurface::Toprak == (uint8)RizeSim::ESurfaceType::Toprak, "Zemin sıralaması uyumsuz");

namespace RizeConv
{
	inline ERizeDayPhase ToBP(RizeSim::EDayPhase P) { return (ERizeDayPhase)(uint8)P; }
	inline ERizeWeather ToBP(RizeSim::EWeatherState S) { return (ERizeWeather)(uint8)S; }
	inline RizeSim::EWeatherState FromBP(ERizeWeather S) { return (RizeSim::EWeatherState)(uint8)S; }
	inline RizeSim::ESurfaceType FromBP(ERizeSurface S) { return (RizeSim::ESurfaceType)(uint8)S; }

	inline std::string ToStd(const FString& S) { return std::string(TCHAR_TO_UTF8(*S)); }
	inline FString FromStd(const std::string& S) { return FString(UTF8_TO_TCHAR(S.c_str())); }
}
