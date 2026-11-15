#include "Weather/RizeWeatherSubsystem.h"

#include "Camera/PlayerCameraManager.h"
#include "Core/RizeSimSettings.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "NiagaraSystem.h"
#include "RizeSim.h"
#include "Sim/RizeDriving.h"
#include "Time/RizeTimeSubsystem.h"

void URizeWeatherSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	Time = Collection.InitializeDependency<URizeTimeSubsystem>();

	const URizeSimSettings* S = URizeSimSettings::Get();
	Model = RizeSim::FWeatherModel((uint64)(uint32)S->WeatherSeed);
	LastState = Model.GetState();
	MPC = S->EnvironmentMPC.LoadSynchronous();
	RainSystem = S->RainSystem.LoadSynchronous();

	if (!MPC)
	{
		UE_LOG(LogRize, Warning, TEXT("EnvironmentMPC atanmamış: ıslaklık/sis malzemelere aktarılamayacak (Proje Ayarları → Rize Simülasyonu)."));
	}
}

bool URizeWeatherSubsystem::DoesSupportWorldType(const EWorldType::Type WorldType) const
{
	return WorldType == EWorldType::Game || WorldType == EWorldType::PIE;
}

TStatId URizeWeatherSubsystem::GetStatId() const
{
	RETURN_QUICK_DECLARE_CYCLE_STAT(URizeWeatherSubsystem, STATGROUP_Tickables);
}

void URizeWeatherSubsystem::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	if (!Time) return;

	Model.Tick(Time->ToGameSeconds(DeltaTime), Time->GetHour(), Time->GetDayOfYear());

	if (Model.GetState() != LastState)
	{
		const ERizeWeather Old = RizeConv::ToBP(LastState);
		LastState = Model.GetState();
		UE_LOG(LogRize, Log, TEXT("Hava değişti: %s → %s (%s)"),
			UTF8_TO_TCHAR(RizeSim::WeatherName(RizeConv::FromBP(Old))),
			UTF8_TO_TCHAR(RizeSim::WeatherName(LastState)),
			*Time->GetClockText().ToString());
		OnWeatherChanged.Broadcast(Old, RizeConv::ToBP(LastState));
	}

	PushToMaterials();
	UpdateRainEffect();
}

float URizeWeatherSubsystem::GetSurfaceGrip(ERizeSurface Surface) const
{
	const RizeSim::FWeatherParams& P = Model.GetParams();
	return (float)RizeSim::Driving::SurfaceGrip(RizeConv::FromBP(Surface), P.Wetness, P.Puddles);
}

void URizeWeatherSubsystem::ForceWeather(ERizeWeather Weather, bool bInstant)
{
	const ERizeWeather Old = GetWeather();
	Model.ForceState(RizeConv::FromBP(Weather), bInstant);
	LastState = Model.GetState();
	if (Old != Weather) OnWeatherChanged.Broadcast(Old, Weather);
}

void URizeWeatherSubsystem::RestoreState(ERizeWeather Weather, int64 RngState)
{
	Model.ForceState(RizeConv::FromBP(Weather), true);
	Model.GetRng().SetState((uint64)RngState);
	LastState = Model.GetState();
}

void URizeWeatherSubsystem::PushToMaterials()
{
	if (!MPC) return;
	UWorld* World = GetWorld();
	const RizeSim::FWeatherParams& P = Model.GetParams();
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("Wetness"), (float)P.Wetness);
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("Puddles"), (float)P.Puddles);
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("RainIntensity"), (float)P.Rain);
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("FogDensity"), (float)P.Fog);
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("Wind"), (float)P.Wind);
	UKismetMaterialLibrary::SetScalarParameterValue(World, MPC, TEXT("SunElevation"), (float)Time->GetSunElevationDeg());
}

void URizeWeatherSubsystem::UpdateRainEffect()
{
	if (!RainSystem) return;
	const float Rain = (float)Model.GetParams().Rain;

	// Yağmur yalnızca oyuncunun etrafında simüle edilir (performans)
	if (!RainComponent || !RainComponent->IsValidLowLevel())
	{
		if (Rain < 0.01f) return;
		APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
		if (!PC || !PC->PlayerCameraManager) return;
		RainComponent = UNiagaraFunctionLibrary::SpawnSystemAttached(
			RainSystem, PC->PlayerCameraManager->GetRootComponent(), NAME_None,
			FVector(0, 0, 400), FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, false);
	}
	if (RainComponent)
	{
		RainComponent->SetVariableFloat(TEXT("User.RainIntensity"), Rain);
		RainComponent->SetVariableFloat(TEXT("User.Wind"), (float)Model.GetParams().Wind);
		RainComponent->SetVisibility(Rain > 0.01f);
	}
}
