// Hava durumunun sahibi. Saf modeli (Sim/RizeWeatherModel.h) oyun saatiyle ilerletir,
// sonucu Material Parameter Collection'a ve oyuncuya bağlı yağmur efektine yazar.
//
// MPC parametreleri (malzemeler bunları okur):
//   Wetness       0..1  → pürüzlülük düşer, albedo koyulaşır: Lumen ıslak asfalt yansıması
//   Puddles       0..1  → yükseklik maskeli birikinti katmanı
//   RainIntensity 0..1  → yağmur damlası halkaları, cam üzerindeki damlalar
//   FogDensity    0..1
//   Wind          0..1  → ağaç / çay yaprağı sallanması
//   SunElevation  derece

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "Sim/RizeWeatherModel.h"
#include "Subsystems/WorldSubsystem.h"
#include "RizeWeatherSubsystem.generated.h"

class UMaterialParameterCollection;
class UNiagaraComponent;
class UNiagaraSystem;
class URizeTimeSubsystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FRizeOnWeatherChanged, ERizeWeather, OldWeather, ERizeWeather, NewWeather);

UCLASS()
class RIZESIM_API URizeWeatherSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override;
	virtual bool DoesSupportWorldType(const EWorldType::Type WorldType) const override;

	UFUNCTION(BlueprintPure, Category = "Rize|Hava") ERizeWeather GetWeather() const { return RizeConv::ToBP(Model.GetState()); }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetRain() const { return (float)Model.GetParams().Rain; }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetFog() const { return (float)Model.GetParams().Fog; }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetCloud() const { return (float)Model.GetParams().Cloud; }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetWind() const { return (float)Model.GetParams().Wind; }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetWetness() const { return (float)Model.GetParams().Wetness; }
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetPuddles() const { return (float)Model.GetParams().Puddles; }

	/** Bu zeminde şu anki tutuş çarpanı (1 = kuru asfalt). */
	UFUNCTION(BlueprintPure, Category = "Rize|Hava") float GetSurfaceGrip(ERizeSurface Surface) const;

	/** Yönetmen komutu: havayı değiştir. bInstant=false ise doğal geçişle gelir. */
	UFUNCTION(BlueprintCallable, Category = "Rize|Hava") void ForceWeather(ERizeWeather Weather, bool bInstant = false);

	/** Kayıt/yükleme için RNG durumu (aynı hava devam etsin). */
	int64 GetRngState() const { return (int64)Model.GetRng().GetState(); }
	void RestoreState(ERizeWeather Weather, int64 RngState);

	UPROPERTY(BlueprintAssignable, Category = "Rize|Hava") FRizeOnWeatherChanged OnWeatherChanged;

private:
	void PushToMaterials();
	void UpdateRainEffect();

	RizeSim::FWeatherModel Model;
	RizeSim::EWeatherState LastState = RizeSim::EWeatherState::Bulutlu;

	UPROPERTY() TObjectPtr<URizeTimeSubsystem> Time;
	UPROPERTY() TObjectPtr<UMaterialParameterCollection> MPC;
	UPROPERTY() TObjectPtr<UNiagaraSystem> RainSystem;
	UPROPERTY() TObjectPtr<UNiagaraComponent> RainComponent;
};
