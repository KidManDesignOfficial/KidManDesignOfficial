#include "Audio/RizeAmbientZone.h"

#include "Components/AudioComponent.h"
#include "Components/BoxComponent.h"
#include "Shops/RizeShop.h"
#include "Time/RizeTimeSubsystem.h"
#include "Weather/RizeWeatherSubsystem.h"

ARizeAmbientZone::ARizeAmbientZone()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickInterval = 0.2f;
	Volume = CreateDefaultSubobject<UBoxComponent>(TEXT("Volume"));
	Volume->SetBoxExtent(FVector(600, 600, 300));
	Volume->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	RootComponent = Volume;
	Audio = CreateDefaultSubobject<UAudioComponent>(TEXT("Audio"));
	Audio->SetupAttachment(Volume);
	Audio->bAutoActivate = false;
}

void ARizeAmbientZone::BeginPlay()
{
	Super::BeginPlay();
	if (Ambience)
	{
		Audio->SetSound(Ambience);
		Audio->SetVolumeMultiplier(0.f);
		Audio->Play(FMath::FRand() * 10.f); // aynı döngü her mekanda aynı yerden başlamasın
	}
}

void ARizeAmbientZone::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	const URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();

	float Target = 1.f;
	if (T && PhaseVolume.Num() > 0)
	{
		const float* V = PhaseVolume.Find(T->GetPhase());
		Target = V ? *V : 0.f;
	}
	if (Shop && !Shop->IsOpenNow()) Target = 0.f;
	if (!bIndoor && W) Target *= FMath::Lerp(1.f, 0.35f, W->GetRain()); // dış mekan: yağmur bastırır

	Current = FMath::FInterpConstantTo(Current, Target, DeltaSeconds, FadeSpeed);
	Audio->SetVolumeMultiplier(Current);
}
