#include "Vehicles/RizeDolmusOperatorComponent.h"

#include "ChaosVehicleMovementComponent.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "EngineUtils.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Transport/RizeDolmusStop.h"
#include "Vehicles/RizeDrivableVehicle.h"

URizeDolmusOperatorComponent::URizeDolmusOperatorComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	PrimaryComponentTick.TickInterval = 0.25f;
}

ARizeDolmusStop* URizeDolmusOperatorComponent::NearbyLineStop() const
{
	const FVector Here = GetOwner()->GetActorLocation();
	for (TActorIterator<ARizeDolmusStop> It(GetWorld()); It; ++It)
	{
		if (It->Lines.Contains(LineId) && FVector::Dist(Here, It->GetActorLocation()) < StopRadiusCm) return *It;
	}
	return nullptr;
}

void URizeDolmusOperatorComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	ARizeDrivableVehicle* V = Cast<ARizeDrivableVehicle>(GetOwner());
	if (!V || !V->IsOccupied() || LineId.IsNone()) { StillTimer = 0.f; return; }

	if (FMath::Abs(V->GetSpeedKmh()) > 1.f) { StillTimer = 0.f; return; }
	ARizeDolmusStop* Stop = NearbyLineStop();
	if (!Stop || Stop == LastServed.Get()) return;

	StillTimer += DeltaTime;
	if (StillTimer < BoardingSeconds) return;
	StillTimer = 0.f;
	LastServed = Stop;

	const int32 Alighted = Passengers > 0 ? FMath::RandRange(0, Passengers) : 0;
	Passengers -= Alighted;
	const int32 Boarded = Stop->TakeNpcs(Seats - Passengers);
	Passengers += Boarded;

	const URizeDataSubsystem* Data = GetWorld()->GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeDolmusLineDef* Line = Data ? Data->FindLine(LineId) : nullptr;
	const int64 Fare = Line ? Line->FareKurus : 0;
	const int64 Net = (int64)(Boarded * Fare * (1.f - CostRatio));
	TodayRevenueKurus += Net;

	// Hasılat oyuncunun cüzdanına
	for (TActorIterator<ARizePlayerCharacter> It(GetWorld()); It; ++It)
	{
		if (It->GetWallet()) It->GetWallet()->Receive(Net);
		break;
	}
	OnStopServed.Broadcast(FText::FromString(Stop->DisplayName), Boarded, Alighted);
}
