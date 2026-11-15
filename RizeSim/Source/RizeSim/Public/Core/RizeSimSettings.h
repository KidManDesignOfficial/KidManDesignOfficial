// Proje Ayarları → Oyun → Rize Simülasyonu. Coğrafi referans, zaman ve atmosfer varlıkları.

#pragma once

#include "CoreMinimal.h"
#include "Chaos/ChaosEngineInterface.h"
#include "Core/RizeTypes.h"
#include "Engine/DeveloperSettings.h"
#include "RizeSimSettings.generated.h"

class UMaterialParameterCollection;
class UNiagaraSystem;

UCLASS(Config = Game, DefaultConfig, meta = (DisplayName = "Rize Simülasyonu"))
class RIZESIM_API URizeSimSettings : public UDeveloperSettings
{
	GENERATED_BODY()

public:
	URizeSimSettings();


	static const URizeSimSettings* Get() { return GetDefault<URizeSimSettings>(); }

	// ---- Coğrafya -------------------------------------------------------
	UPROPERTY(Config, EditAnywhere, Category = "Coğrafya")
	double LatitudeDeg = 41.0201;

	UPROPERTY(Config, EditAnywhere, Category = "Coğrafya")
	double LongitudeDeg = 40.5234;

	UPROPERTY(Config, EditAnywhere, Category = "Coğrafya")
	double UtcOffsetHours = 3.0;

	/** Dünya +X ekseni doğuyu gösterir (araç hattı bu kurala göre içe aktarır). Gerekirse düzeltme açısı. */
	UPROPERTY(Config, EditAnywhere, Category = "Coğrafya")
	double WorldNorthYawDeg = 0.0;

	// ---- Zaman ----------------------------------------------------------
	UPROPERTY(Config, EditAnywhere, Category = "Zaman", meta = (ClampMin = 1, ClampMax = 365))
	int32 StartDayOfYear = 135;

	UPROPERTY(Config, EditAnywhere, Category = "Zaman", meta = (ClampMin = 0, ClampMax = 24))
	double StartHour = 7.0;

	/** Oyun saniyesi / gerçek saniye. 24 → bir gün 60 gerçek dakika. */
	UPROPERTY(Config, EditAnywhere, Category = "Zaman", meta = (ClampMin = 0))
	double TimeScale = 24.0;

	/** Sokak lambalarının yandığı güneş yüksekliği (derece). */
	UPROPERTY(Config, EditAnywhere, Category = "Zaman")
	double StreetLightsOnElevationDeg = 3.0;

	// ---- Atmosfer -------------------------------------------------------
	UPROPERTY(Config, EditAnywhere, Category = "Atmosfer")
	int32 WeatherSeed = 1381193285;

	/** Malzemelerin okuduğu küresel parametreler: Wetness, Puddles, RainIntensity, FogDensity, Wind, SunElevation. */
	UPROPERTY(Config, EditAnywhere, Category = "Atmosfer")
	TSoftObjectPtr<UMaterialParameterCollection> EnvironmentMPC;

	/** Oyuncu kamerasına bağlanan yağmur efekti. Kullanıcı parametresi: RainIntensity, Wind. */
	UPROPERTY(Config, EditAnywhere, Category = "Atmosfer")
	TSoftObjectPtr<UNiagaraSystem> RainSystem;

	// ---- Sürüş ----------------------------------------------------------
	/** Fiziksel malzeme yüzey tipi → simülasyon zemin tipi (tutuş hesabı için). */
	UPROPERTY(Config, EditAnywhere, Category = "Sürüş")
	TMap<TEnumAsByte<EPhysicalSurface>, ERizeSurface> SurfaceMap;
};
