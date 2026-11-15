// Seviyeye bir kez yerleştirilir. Güneşi gerçek astronomik konuma, ay ışığını
// gece konumuna döndürür; bulut/sis/yağmura göre ışık ve sis şiddetini ayarlar.
// Gökyüzü renkleri SkyAtmosphere tarafından fiziksel olarak üretilir.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RizeSkyController.generated.h"

class ADirectionalLight;
class AExponentialHeightFog;
class ASkyLight;
class URizeTimeSubsystem;
class URizeWeatherSubsystem;

UCLASS()
class RIZESIM_API ARizeSkyController : public AActor
{
	GENERATED_BODY()

public:
	ARizeSkyController();
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditInstanceOnly, Category = "Gökyüzü") TObjectPtr<ADirectionalLight> SunLight;
	UPROPERTY(EditInstanceOnly, Category = "Gökyüzü") TObjectPtr<ADirectionalLight> MoonLight;
	UPROPERTY(EditInstanceOnly, Category = "Gökyüzü") TObjectPtr<ASkyLight> SkyLight;
	UPROPERTY(EditInstanceOnly, Category = "Gökyüzü") TObjectPtr<AExponentialHeightFog> HeightFog;

	/** Açık havada tepe güneş aydınlığı (lux). */
	UPROPERTY(EditAnywhere, Category = "Işık") float SunLuxClear = 100000.f;
	/** Kapalı Karadeniz göğü altında kalan oran. */
	UPROPERTY(EditAnywhere, Category = "Işık") float SunOvercastFactor = 0.18f;
	UPROPERTY(EditAnywhere, Category = "Işık") float MoonLux = 0.3f;
	UPROPERTY(EditAnywhere, Category = "Işık") float SkyLightDay = 1.0f;
	UPROPERTY(EditAnywhere, Category = "Işık") float SkyLightNight = 0.08f;

	/** Sis: açık hava ve tam sis yoğunlukları. Vadi tabanında sis daha kalın (yükseklik sönümü). */
	UPROPERTY(EditAnywhere, Category = "Sis") float FogDensityClear = 0.005f;
	UPROPERTY(EditAnywhere, Category = "Sis") float FogDensityFull = 0.12f;
	UPROPERTY(EditAnywhere, Category = "Sis") float FogFalloffClear = 0.2f;
	UPROPERTY(EditAnywhere, Category = "Sis") float FogFalloffFull = 0.05f;

	/** Seviye editöründe saati önizlemek için (yalnızca editör). */
	UPROPERTY(EditAnywhere, Category = "Önizleme", meta = (ClampMin = 0, ClampMax = 24)) float PreviewHour = 9.0f;
	UPROPERTY(EditAnywhere, Category = "Önizleme", meta = (ClampMin = 1, ClampMax = 365)) int32 PreviewDayOfYear = 135;

#if WITH_EDITOR
	virtual void PostEditChangeProperty(FPropertyChangedEvent& Event) override;
#endif

private:
	void Apply(double ElevationDeg, double AzimuthDeg, float Cloud, float Fog, float Rain);

	UPROPERTY() TObjectPtr<URizeTimeSubsystem> Time;
	UPROPERTY() TObjectPtr<URizeWeatherSubsystem> Weather;
};
