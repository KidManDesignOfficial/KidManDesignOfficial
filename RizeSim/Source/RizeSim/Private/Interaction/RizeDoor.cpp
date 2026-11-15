#include "Interaction/RizeDoor.h"

#include "Components/StaticMeshComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Shops/RizeShop.h"

#define LOCTEXT_NAMESPACE "RizeDoor"

ARizeDoor::ARizeDoor()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	Hinge = CreateDefaultSubobject<USceneComponent>(TEXT("Hinge"));
	Hinge->SetupAttachment(RootComponent);
	Panel = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Panel"));
	Panel->SetupAttachment(Hinge);
}

bool ARizeDoor::IsLocked() const
{
	return Shop && !Shop->IsOpenNow();
}

FText ARizeDoor::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	if (IsLocked())
	{
		return FText::Format(LOCTEXT("Closed", "Kapalı — {0}"), Shop->GetOpeningHint());
	}
	return bOpen ? LOCTEXT("Close", "Kapıyı kapat") : LOCTEXT("Open", "Kapıyı aç");
}

void ARizeDoor::Interact_Implementation(AActor* Interactor)
{
	if (IsLocked() && !bOpen)
	{
		if (LockedSound) UGameplayStatics::PlaySoundAtLocation(this, LockedSound, GetActorLocation());
		return;
	}
	bOpen = !bOpen;
	if (bOpen)
	{
		// Oyuncudan uzağa doğru aç
		if (Interactor)
		{
			const FVector ToPlayer = Interactor->GetActorLocation() - GetActorLocation();
			OpenSign = FVector::DotProduct(ToPlayer, GetActorForwardVector()) > 0.f ? -1.f : 1.f;
		}
		OpenTimer = 0.f;
		if (OpenSound) UGameplayStatics::PlaySoundAtLocation(this, OpenSound, GetActorLocation());
		if (BellSound && Shop) UGameplayStatics::PlaySoundAtLocation(this, BellSound, GetActorLocation());
	}
}

void ARizeDoor::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (bOpen && AutoCloseSeconds > 0.f)
	{
		OpenTimer += DeltaSeconds;
		if (OpenTimer >= AutoCloseSeconds) bOpen = false;
	}
	const float Target = bOpen ? OpenAngle * OpenSign : 0.f;
	if (!FMath::IsNearlyEqual(CurrentAngle, Target, 0.05f))
	{
		CurrentAngle = FMath::FInterpTo(CurrentAngle, Target, DeltaSeconds, OpenSpeed);
		Hinge->SetRelativeRotation(FRotator(0.f, CurrentAngle, 0.f));
	}
}

#undef LOCTEXT_NAMESPACE
