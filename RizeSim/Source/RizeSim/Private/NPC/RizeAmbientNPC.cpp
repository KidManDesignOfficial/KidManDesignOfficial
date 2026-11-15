#include "NPC/RizeAmbientNPC.h"

#include "AIController.h"
#include "Components/CapsuleComponent.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NPC/RizeLocationMarker.h"
#include "Player/RizePlayerCharacter.h"
#include "Sim/RizeSchedule.h"
#include "Time/RizeTimeSubsystem.h"
#include "TimerManager.h"
#include "Weather/RizeWeatherSubsystem.h"

#define LOCTEXT_NAMESPACE "RizeNPC"

ARizeAmbientNPC::ARizeAmbientNPC()
{
	AIControllerClass = AAIController::StaticClass();
	AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0, 240, 0);
	bUseControllerRotationYaw = false;
	// Oyuncunun etkileşim ışını (Visibility) NPC'ye çarpsın
	GetCapsuleComponent()->SetCollisionResponseToChannel(ECC_Visibility, ECR_Block);
}

void ARizeAmbientNPC::BeginPlay()
{
	Super::BeginPlay();
	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed * FMath::FRandRange(0.85f, 1.15f); // herkes aynı hızda yürümez

	if (URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>())
	{
		T->OnHourChanged.AddDynamic(this, &ARizeAmbientNPC::OnHourChanged);
	}
	if (URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>())
	{
		W->OnWeatherChanged.AddDynamic(this, &ARizeAmbientNPC::OnWeatherChanged);
	}
	// Herkes aynı karede karar vermesin
	FTimerHandle H;
	GetWorldTimerManager().SetTimer(H, this, &ARizeAmbientNPC::Reevaluate, FMath::FRandRange(0.2f, 2.f), false);
}

void ARizeAmbientNPC::EndPlay(const EEndPlayReason::Type Reason)
{
	if (Target.IsValid() && Target->Occupant.Get() == this) Target->Occupant.Reset();
	Super::EndPlay(Reason);
}

FName ARizeAmbientNPC::GetCurrentPose() const
{
	return bArrived && Target.IsValid() ? Target->Pose : NAME_None;
}

void ARizeAmbientNPC::OnHourChanged(int32 Hour)
{
	Reevaluate();
}

void ARizeAmbientNPC::OnWeatherChanged(ERizeWeather OldWeather, ERizeWeather NewWeather)
{
	const bool bRain = NewWeather == ERizeWeather::Cisenti || NewWeather == ERizeWeather::Saganak;
	OnWeatherReaction(bRain);
	// Sağanakta açık havadaki etkinlikler (sahil yürüyüşü) bırakılır: saçak altına / kahveye
	if (NewWeather == ERizeWeather::Saganak) Reevaluate();
}

void ARizeAmbientNPC::Reevaluate()
{
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const FRizeScheduleDef* Def = Data ? Data->FindSchedule(ScheduleId) : nullptr;
	if (!Def || !Time) return;

	RizeSim::FDailySchedule Schedule;
	for (const FRizeScheduleEntryDef& E : Def->Entries)
	{
		Schedule.Entries.push_back({{E.From, E.To}, RizeConv::ToStd(E.Activity.ToString()), RizeConv::ToStd(E.Location.ToString()), E.Weekdays});
	}
	const int32 Index = Schedule.Resolve(Time->GetHour(), Time->GetWeekday());

	FName Activity = Index >= 0 ? Def->Entries[Index].Activity : FName(TEXT("ev"));
	FName Location = Index >= 0 ? Def->Entries[Index].Location : FName(TEXT("ev"));

	// Sağanakta dışarıdaki etkinlikten kaçış
	const URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	if (W && W->GetWeather() == ERizeWeather::Saganak && Location.ToString().StartsWith(TEXT("sahil")))
	{
		Activity = TEXT("yagmurdan_kacis");
		Location = TEXT("sacak_alti");
	}

	if (Activity == CurrentActivity && Target.IsValid()) return;
	CurrentActivity = Activity;
	bArrived = false;

	if (Target.IsValid() && Target->Occupant.Get() == this) Target->Occupant.Reset();
	Target = ARizeLocationMarker::FindFree(GetWorld(), Location, GetActorLocation(), this);

	if (!Target.IsValid())
	{
		// "ev": dünyada görünmez olur (eve girdi); program onu tekrar çıkarana kadar
		SetActorHiddenInGame(Location == TEXT("ev"));
		SetActorEnableCollision(Location != TEXT("ev"));
		return;
	}
	SetActorHiddenInGame(false);
	SetActorEnableCollision(true);
	Target->Occupant = this;

	if (AAIController* AI = Cast<AAIController>(GetController()))
	{
		AI->MoveToLocation(Target->GetActorLocation(), 40.f, true, true, true, false);
	}
	GetWorldTimerManager().SetTimer(ArrivalTimer, this, &ARizeAmbientNPC::CheckArrival, 0.5f, true);
}

void ARizeAmbientNPC::CheckArrival()
{
	if (!Target.IsValid()) { GetWorldTimerManager().ClearTimer(ArrivalTimer); return; }
	if (FVector::Dist2D(GetActorLocation(), Target->GetActorLocation()) < 80.f)
	{
		bArrived = true;
		GetWorldTimerManager().ClearTimer(ArrivalTimer);
		SetActorRotation(FRotator(0, Target->GetActorRotation().Yaw, 0));
		OnActivityStarted(CurrentActivity, Target->Pose);
	}
}

FText ARizeAmbientNPC::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	return FText::Format(LOCTEXT("Talk", "Selam ver — {0}"), FText::FromString(DisplayName));
}

void ARizeAmbientNPC::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P) return;
	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - LastTalkTime < 3.0) return; // laf yetiştirmeye çalışma
	LastTalkTime = Now;

	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	const FName Place = Target.IsValid() ? Target->LocationTag : NAME_None;
	FString Line = Data ? Data->PickDialogue(SpeakerType, T ? T->GetPhase() : ERizeDayPhase::Sabah,
		W ? W->GetWeather() : ERizeWeather::Acik, Place) : FString();
	if (Line.IsEmpty()) Line = TEXT("Selamünaleyküm.");

	// Oyuncuya dön
	const FVector To = (P->GetActorLocation() - GetActorLocation()).GetSafeNormal2D();
	SetActorRotation(To.Rotation());
	P->ShowSubtitle(FText::FromString(DisplayName), FText::FromString(Line));
}

#undef LOCTEXT_NAMESPACE
