#include "Weather/RizeSkyController.h"

#include "Components/DirectionalLightComponent.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Components/SkyLightComponent.h"
#include "Core/RizeSimSettings.h"
#include "Engine/DirectionalLight.h"
#include "Engine/ExponentialHeightFog.h"
#include "Engine/SkyLight.h"
#include "Engine/World.h"
#include "Sim/RizeSolar.h"
#include "Time/RizeTimeSubsystem.h"
#include "Weather/RizeWeatherSubsystem.h"

ARizeSkyController::ARizeSkyController()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickGroup = TG_PostUpdateWork;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void ARizeSkyController::BeginPlay()
{
	Super::BeginPlay();
	Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	Weather = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
}

void ARizeSkyController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!Time) return;
	const float Cloud = Weather ? Weather->GetCloud() : 0.2f;
	const float Fog = Weather ? Weather->GetFog() : 0.02f;
	const float Rain = Weather ? Weather->GetRain() : 0.0f;
	Apply(Time->GetSunElevationDeg(), Time->GetSunAzimuthDeg(), Cloud, Fog, Rain);
}

void ARizeSkyController::Apply(double ElevationDeg, double AzimuthDeg, float Cloud, float Fog, float Rain)
{
	const double NorthOffset = URizeSimSettings::Get()->WorldNorthYawDeg;

	// Dünya kuralı: +X = Doğu, +Y = Güney (UE sol el koordinatı), Z = yukarı.
	// Pusula azimutu (K=0, saat yönü) → UE yaw: yaw = azimut - 90.
	// Işık güneşten GELİR: yön vektörü güneşin tersidir → yaw + 180, pitch = -yükseklik.
	const double SunYaw = AzimuthDeg - 90.0 + 180.0 + NorthOffset;

	// Ufuk geçişinde ani sönme olmasın: -4°..+6° arası yumuşak geçiş
	const float DayFactor = FMath::SmoothStep(-4.f, 6.f, (float)ElevationDeg);
	const float CloudDim = FMath::Lerp(1.f, SunOvercastFactor, Cloud) * (1.f - 0.3f * Rain);

	if (SunLight)
	{
		SunLight->SetActorRotation(FRotator(-ElevationDeg, SunYaw, 0.0));
		if (UDirectionalLightComponent* L = Cast<UDirectionalLightComponent>(SunLight->GetLightComponent()))
		{
			L->SetIntensity(SunLuxClear * DayFactor * CloudDim);
			L->SetVisibility(ElevationDeg > -6.0);
		}
	}

	if (MoonLight)
	{
		// Basit ay: güneşin karşısında, gece yükselir. Bulutlu gecede neredeyse hiç.
		MoonLight->SetActorRotation(FRotator(-FMath::Max(10.0, -ElevationDeg), SunYaw + 180.0, 0.0));
		if (UDirectionalLightComponent* L = Cast<UDirectionalLightComponent>(MoonLight->GetLightComponent()))
		{
			L->SetIntensity(MoonLux * (1.f - DayFactor) * FMath::Lerp(1.f, 0.1f, Cloud));
		}
	}

	if (SkyLight && SkyLight->GetLightComponent())
	{
		SkyLight->GetLightComponent()->SetIntensity(FMath::Lerp(SkyLightNight, SkyLightDay, DayFactor) * FMath::Lerp(1.f, 0.7f, Cloud));
	}

	if (HeightFog)
	{
		if (UExponentialHeightFogComponent* F = HeightFog->GetComponent())
		{
			const float FogAmount = FMath::Clamp(Fog + 0.25f * Rain, 0.f, 1.f);
			F->SetFogDensity(FMath::Lerp(FogDensityClear, FogDensityFull, FogAmount));
			F->SetFogHeightFalloff(FMath::Lerp(FogFalloffClear, FogFalloffFull, FogAmount));
			F->SetVolumetricFogExtinctionScale(FMath::Lerp(1.f, 6.f, FogAmount));
		}
	}
}

#if WITH_EDITOR
void ARizeSkyController::PostEditChangeProperty(FPropertyChangedEvent& Event)
{
	Super::PostEditChangeProperty(Event);
	if (GetWorld() && !GetWorld()->IsGameWorld())
	{
		RizeSim::FGeoReference Geo;
		const URizeSimSettings* S = URizeSimSettings::Get();
		Geo.LatitudeDeg = S->LatitudeDeg;
		Geo.LongitudeDeg = S->LongitudeDeg;
		Geo.UtcOffsetHours = S->UtcOffsetHours;
		const RizeSim::FSolarAngles A = RizeSim::Solar::Compute(PreviewDayOfYear, PreviewHour, Geo);
		Apply(A.ElevationDeg, A.AzimuthDeg, 0.3f, 0.05f, 0.f);
	}
}
#endif
