#include "Time/RizeTimeSubsystem.h"

#include "Core/RizeSimSettings.h"
#include "RizeSim.h"

void URizeTimeSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	const URizeSimSettings* S = URizeSimSettings::Get();
	Geo.LatitudeDeg = S->LatitudeDeg;
	Geo.LongitudeDeg = S->LongitudeDeg;
	Geo.UtcOffsetHours = S->UtcOffsetHours;
	Clock.TimeScale = S->TimeScale;
	Clock.StartDayOfYear = S->StartDayOfYear;
	Clock.SetTime(0, S->StartHour);
	LightsThresholdDeg = S->StreetLightsOnElevationDeg;

	Recompute(true);
	UE_LOG(LogRize, Log, TEXT("Rize saati başlatıldı: gün %d, %s"), Clock.GetDay() + 1, *GetClockText().ToString());
}

bool URizeTimeSubsystem::DoesSupportWorldType(const EWorldType::Type WorldType) const
{
	return WorldType == EWorldType::Game || WorldType == EWorldType::PIE;
}

TStatId URizeTimeSubsystem::GetStatId() const
{
	RETURN_QUICK_DECLARE_CYCLE_STAT(URizeTimeSubsystem, STATGROUP_Tickables);
}

void URizeTimeSubsystem::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	Clock.Advance(DeltaTime);
	Recompute(false);
}

void URizeTimeSubsystem::Recompute(bool bForceEvents)
{
	Sun = RizeSim::Solar::Compute(Clock.GetDayOfYear(), Clock.GetHour(), Geo);

	const int32 Hour = Clock.GetHourInt();
	if (Hour != LastHour || bForceEvents)
	{
		LastHour = Hour;
		OnHourChanged.Broadcast(Hour);
	}

	const RizeSim::EDayPhase Phase = Clock.GetPhase();
	if (Phase != LastPhase || bForceEvents)
	{
		LastPhase = Phase;
		OnPhaseChanged.Broadcast(RizeConv::ToBP(Phase));
	}

	// Histerezis: alacakaranlıkta lambalar yanıp sönüp durmasın
	const bool bWantLights = bStreetLightsOn ? (Sun.ElevationDeg < LightsThresholdDeg + 1.0)
	                                         : (Sun.ElevationDeg < LightsThresholdDeg);
	if (bWantLights != bStreetLightsOn || bForceEvents)
	{
		bStreetLightsOn = bWantLights;
		OnStreetLightsChanged.Broadcast(bStreetLightsOn);
	}
}

FText URizeTimeSubsystem::GetClockText() const
{
	return FText::FromString(FString::Printf(TEXT("%02d:%02d"), Clock.GetHourInt(), Clock.GetMinute()));
}

void URizeTimeSubsystem::SetTimeOfDay(double Hour)
{
	Clock.SetTime(Clock.GetDay(), Hour);
	Recompute(true);
}

void URizeTimeSubsystem::SetDayAndHour(int32 Day, double Hour)
{
	Clock.SetTime(FMath::Max(0, Day), Hour);
	Recompute(true);
}

void URizeTimeSubsystem::SetTimeScale(double NewScale)
{
	Clock.TimeScale = FMath::Max(0.0, NewScale);
}
