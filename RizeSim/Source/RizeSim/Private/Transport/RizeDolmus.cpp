#include "Transport/RizeDolmus.h"

#include "Components/AudioComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Core/RizeTypes.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "EngineUtils.h"
#include "Kismet/GameplayStatics.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "RizeSim.h"
#include "Time/RizeTimeSubsystem.h"
#include "Transport/RizeDolmusStop.h"
#include "Transport/RizeRoadPath.h"
#include "Transport/RizeSplineFollowerComponent.h"

#define LOCTEXT_NAMESPACE "RizeDolmus"

ARizeDolmus::ARizeDolmus()
{
	PrimaryActorTick.bCanEverTick = true;
	Body = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Body"));
	RootComponent = Body;
	Body->SetCollisionProfileName(TEXT("BlockAllDynamic"));

	Follower = CreateDefaultSubobject<URizeSplineFollowerComponent>(TEXT("Follower"));
	Follower->VehicleLengthCm = 600.f; // minibüs
	Follower->DriverTemper = 1.0f;

	PlayerSeat = CreateDefaultSubobject<USceneComponent>(TEXT("PlayerSeat"));
	PlayerSeat->SetupAttachment(Body);
	PlayerSeat->SetRelativeLocation(FVector(-80, 55, 60)); // sağ arka cam kenarı

	DoorPoint = CreateDefaultSubobject<USceneComponent>(TEXT("DoorPoint"));
	DoorPoint->SetupAttachment(Body);
	DoorPoint->SetRelativeLocation(FVector(0, 190, 90));

	EngineAudio = CreateDefaultSubobject<UAudioComponent>(TEXT("EngineAudio"));
	EngineAudio->SetupAttachment(Body);
}

void ARizeDolmus::BeginPlay()
{
	Super::BeginPlay();
	if (!LineId.IsNone() && !Follower->Path) InitOnLine(LineId, 0.f);
}

void ARizeDolmus::InitOnLine(FName InLineId, float StartDistanceCm)
{
	LineId = InLineId;
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeDolmusLineDef* Line = Data ? Data->FindLine(LineId) : nullptr;
	if (!Line)
	{
		UE_LOG(LogRize, Warning, TEXT("Dolmuş: hat bulunamadı '%s'"), *LineId.ToString());
		return;
	}
	FareKurus = Line->FareKurus;
	Follower->SetPath(ARizeRoadPath::FindById(GetWorld(), Line->PathId), StartDistanceCm);
	ResolveStops();
}

void ARizeDolmus::ResolveStops()
{
	Stops.Reset();
	if (!Follower->Path) return;
	for (TActorIterator<ARizeDolmusStop> It(GetWorld()); It; ++It)
	{
		if (!It->Lines.Contains(LineId)) continue;
		// Durak yola 15 m'den uzaksa bu güzergaha ait değildir (karşı şerit vb.)
		const float D = Follower->Path->ProjectToDistance(It->GetActorLocation());
		FRizeLineStop S;
		S.Stop = *It;
		S.DistanceCm = D;
		Stops.Add(S);
	}
	Stops.Sort([](const FRizeLineStop& A, const FRizeLineStop& B) { return A.DistanceCm < B.DistanceCm; });
}

int32 ARizeDolmus::NextStopIndex() const
{
	if (Stops.Num() == 0 || !Follower->Path) return -1;
	int32 Best = -1;
	float BestGap = TNumericLimits<float>::Max();
	for (int32 i = 0; i < Stops.Num(); ++i)
	{
		const float Gap = Follower->Path->ForwardGap(Follower->DistanceCm, Stops[i].DistanceCm);
		if (i == LastServedStop && Gap < 500.f) continue; // az önce kalktığı durak
		if (Gap >= 0.f && Gap < BestGap) { BestGap = Gap; Best = i; }
	}
	return Best;
}

bool ARizeDolmus::IsInServiceHours() const
{
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeDolmusLineDef* Line = Data ? Data->FindLine(LineId) : nullptr;
	const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	if (!Line || !Time) return true;
	const double H = Time->GetHour();
	return H >= Line->FirstDepartureHour && H <= Line->LastDepartureHour;
}

bool ARizeDolmus::ShouldStopAt(int32 i) const
{
	if (!Stops.IsValidIndex(i) || !Stops[i].Stop) return false;
	const ARizeDolmusStop* S = Stops[i].Stop;
	const bool bHasSeat = GetPassengerCount() < Seats;
	const bool bSomeoneWaiting = S->IsPlayerWaiting() || S->GetWaitingNpcCount() > 0;
	const bool bSomeoneOff = bPlayerWantsOff || bNpcWantsOffNext;
	return (bHasSeat && bSomeoneWaiting) || bSomeoneOff || State == ERizeDolmusState::OutOfService;
}

void ARizeDolmus::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!Follower->Path) return;

	// Motor sesi hızla
	if (EngineAudio) EngineAudio->SetFloatParameter(TEXT("Speed"), Follower->GetSpeedMps());

	switch (State)
	{
	case ERizeDolmusState::Driving:
	{
		if (!IsInServiceHours() && !Player.IsValid())
		{
			State = ERizeDolmusState::OutOfService; // son durağa kadar gidip park eder
		}
		TargetStop = NextStopIndex();
		Follower->StopAtDistanceCm = (TargetStop >= 0 && ShouldStopAt(TargetStop)) ? Stops[TargetStop].DistanceCm : -1.f;

		if (Follower->StopAtDistanceCm >= 0.f && Follower->IsStopped() &&
			Follower->Path->ForwardGap(Follower->DistanceCm, Follower->StopAtDistanceCm) < 300.f)
		{
			ArriveAt(TargetStop);
		}
		break;
	}
	case ERizeDolmusState::Dwelling:
		DwellTimer -= DeltaSeconds;
		if (DwellTimer <= 0.f) Depart();
		break;

	case ERizeDolmusState::OutOfService:
		if (IsInServiceHours())
		{
			SetActorHiddenInGame(false);
			SetActorEnableCollision(true);
			State = ERizeDolmusState::Driving;
		}
		else if (Follower->IsStopped() && !IsHidden())
		{
			// Garaja çekildi
			SetActorHiddenInGame(true);
			SetActorEnableCollision(false);
		}
		else
		{
			TargetStop = NextStopIndex();
			Follower->StopAtDistanceCm = TargetStop >= 0 ? Stops[TargetStop].DistanceCm : -1.f;
		}
		break;
	}
}

void ARizeDolmus::ArriveAt(int32 StopIndex)
{
	State = ERizeDolmusState::Dwelling;
	DwellTimer = DwellSeconds;
	LastServedStop = StopIndex;
	if (DoorSound) UGameplayStatics::PlaySoundAtLocation(this, DoorSound, DoorPoint->GetComponentLocation());

	// İnenler
	if (NpcPassengers > 0)
	{
		NpcPassengers -= FMath::Clamp(FMath::RoundToInt(NpcPassengers * FMath::FRandRange(0.1f, 0.4f)), 1, NpcPassengers);
	}
	if (bPlayerWantsOff && Player.IsValid())
	{
		Player->StandUpAt(DoorPoint->GetComponentLocation(), GetActorRotation() + FRotator(0, 90, 0));
		Player->ShowSubtitle(LOCTEXT("Driver", "Şoför"), LOCTEXT("Bye", "Güle güle, hayırlı işler."));
		Player.Reset();
		bPlayerWantsOff = false;
	}

	// Binenler
	if (ARizeDolmusStop* S = Stops[StopIndex].Stop)
	{
		NpcPassengers += S->TakeNpcs(Seats - GetPassengerCount());
		DwellTimer += 1.5f * NpcPassengers * 0.2f;
	}
}

void ARizeDolmus::Depart()
{
	State = ERizeDolmusState::Driving;
	Follower->StopAtDistanceCm = -1.f;
	// Bir sonraki durakta inecek yolcu var mı? (yolcu çoksa olasılık yüksek)
	bNpcWantsOffNext = NpcPassengers > 0 && FMath::FRand() < FMath::Min(0.9f, 0.25f + 0.08f * NpcPassengers);
}

FText ARizeDolmus::GetNextStopName() const
{
	const int32 i = NextStopIndex();
	return Stops.IsValidIndex(i) && Stops[i].Stop ? FText::FromString(Stops[i].Stop->DisplayName) : FText::GetEmpty();
}

bool ARizeDolmus::CanInteract_Implementation(AActor* Interactor) const
{
	if (Player.IsValid()) return Player.Get() == Interactor; // içerideyken yalnızca "inecek var"
	return State == ERizeDolmusState::Dwelling && GetPassengerCount() < Seats;
}

FText ARizeDolmus::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	if (Player.IsValid())
	{
		return bPlayerWantsOff ? LOCTEXT("WillStop", "Sonraki durakta inilecek")
		                       : FText::Format(LOCTEXT("GetOff", "İnecek var! (sonraki: {0})"), GetNextStopName());
	}
	const FString Fare = RizeConv::FromStd(RizeSim::FormatTL(FareKurus));
	return FText::Format(LOCTEXT("Board", "Dolmuşa bin — {0}"), FText::FromString(Fare));
}

void ARizeDolmus::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P) return;

	if (Player.IsValid())
	{
		bPlayerWantsOff = true;
		return;
	}
	if (!P->GetWallet() || !P->GetWallet()->Pay(FareKurus))
	{
		P->ShowSubtitle(LOCTEXT("Driver", "Şoför"), LOCTEXT("NoFare", "Bozuk yok mu abi?"));
		return;
	}
	Player = P;
	for (FRizeLineStop& S : Stops)
	{
		if (S.Stop) S.Stop->SetPlayerWaiting(false);
	}
	P->SitAt(PlayerSeat);
	DwellTimer = FMath::Max(DwellTimer, 2.f);
}

#undef LOCTEXT_NAMESPACE
