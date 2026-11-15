// Oyun saatinin sahibi. Güneş açısını da burada hesaplar; böylece ışık,
// sokak lambaları, NPC programları ve dükkanlar aynı saate bakar.

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "Sim/RizeClock.h"
#include "Sim/RizeSolar.h"
#include "Subsystems/WorldSubsystem.h"
#include "RizeTimeSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FRizeOnHourChanged, int32, Hour);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FRizeOnPhaseChanged, ERizeDayPhase, Phase);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FRizeOnStreetLightsChanged, bool, bLightsOn);

UCLASS()
class RIZESIM_API URizeTimeSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override;
	virtual bool DoesSupportWorldType(const EWorldType::Type WorldType) const override;

	// ---- Sorgular -------------------------------------------------------
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") double GetHour() const { return Clock.GetHour(); }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") int32 GetHourInt() const { return Clock.GetHourInt(); }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") int32 GetMinute() const { return Clock.GetMinute(); }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") int32 GetDay() const { return Clock.GetDay(); }
	/** 0 = Pazartesi … 6 = Pazar. Oyun 1. günü Pazartesi kabul edilir. */
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") int32 GetWeekday() const { return Clock.GetDay() % 7; }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") int32 GetDayOfYear() const { return Clock.GetDayOfYear(); }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") ERizeDayPhase GetPhase() const { return RizeConv::ToBP(Clock.GetPhase()); }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") double GetTimeScale() const { return Clock.TimeScale; }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") double GetSunElevationDeg() const { return Sun.ElevationDeg; }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") double GetSunAzimuthDeg() const { return Sun.AzimuthDeg; }
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") bool AreStreetLightsOn() const { return bStreetLightsOn; }

	/** "07:45" biçiminde saat metni (HUD için). */
	UFUNCTION(BlueprintPure, Category = "Rize|Zaman") FText GetClockText() const;

	/** Gerçek saniye başına geçen oyun saniyesi (hava, trafik gibi oyun-zamanlı sistemler için). */
	double ToGameSeconds(float RealDeltaSeconds) const { return (double)RealDeltaSeconds * Clock.TimeScale; }

	// ---- Yönetmen komutları --------------------------------------------
	UFUNCTION(BlueprintCallable, Category = "Rize|Zaman") void SetTimeOfDay(double Hour);
	UFUNCTION(BlueprintCallable, Category = "Rize|Zaman") void SetTimeScale(double NewScale);
	UFUNCTION(BlueprintCallable, Category = "Rize|Zaman") void SetDayAndHour(int32 Day, double Hour);

	const RizeSim::FClock& GetClock() const { return Clock; }
	const RizeSim::FGeoReference& GetGeo() const { return Geo; }

	// ---- Olaylar --------------------------------------------------------
	UPROPERTY(BlueprintAssignable, Category = "Rize|Zaman") FRizeOnHourChanged OnHourChanged;
	UPROPERTY(BlueprintAssignable, Category = "Rize|Zaman") FRizeOnPhaseChanged OnPhaseChanged;
	UPROPERTY(BlueprintAssignable, Category = "Rize|Zaman") FRizeOnStreetLightsChanged OnStreetLightsChanged;

private:
	void Recompute(bool bForceEvents);

	RizeSim::FClock Clock;
	RizeSim::FGeoReference Geo;
	RizeSim::FSolarAngles Sun;
	RizeSim::EDayPhase LastPhase = RizeSim::EDayPhase::Gece;
	int32 LastHour = -1;
	bool bStreetLightsOn = false;
	double LightsThresholdDeg = 3.0;
};
