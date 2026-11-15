#include "Transport/RizeDolmusStop.h"

#include "Components/StaticMeshComponent.h"
#include "Engine/World.h"
#include "Time/RizeTimeSubsystem.h"
#include "TimerManager.h"
#include "Transport/RizeTrafficSubsystem.h"

#define LOCTEXT_NAMESPACE "RizeStop"

ARizeDolmusStop::ARizeDolmusStop()
{
	Sign = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Sign"));
	RootComponent = Sign;
}

void ARizeDolmusStop::BeginPlay()
{
	Super::BeginPlay();
	GetWorldTimerManager().SetTimer(Timer, this, &ARizeDolmusStop::AccumulatePassengers, 20.f, true, FMath::FRand() * 20.f);
}

void ARizeDolmusStop::AccumulatePassengers()
{
	const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const float Density = URizeTrafficSubsystem::DensityForHour(Time ? (float)Time->GetHour() : 12.f);
	if (FMath::FRand() < 0.35f * Density) WaitingNpcs = FMath::Min(WaitingNpcs + 1, 8);
}

int32 ARizeDolmusStop::TakeNpcs(int32 MaxSeats)
{
	const int32 N = FMath::Clamp(WaitingNpcs, 0, MaxSeats);
	WaitingNpcs -= N;
	return N;
}

FText ARizeDolmusStop::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	return bPlayerWaiting ? LOCTEXT("StopWaiting", "Beklemeyi bırak")
	                      : FText::Format(LOCTEXT("Wait", "Dolmuş bekle — {0}"), FText::FromString(DisplayName));
}

void ARizeDolmusStop::Interact_Implementation(AActor* Interactor)
{
	bPlayerWaiting = !bPlayerWaiting;
}

#undef LOCTEXT_NAMESPACE
