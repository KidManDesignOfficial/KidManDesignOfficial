#include "Audio/RizeNightLightComponent.h"

#include "Components/LightComponent.h"
#include "Components/MeshComponent.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Time/RizeTimeSubsystem.h"
#include "TimerManager.h"

URizeNightLightComponent::URizeNightLightComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void URizeNightLightComponent::BeginPlay()
{
	Super::BeginPlay();
	PersonalOffset = FMath::FRandRange(-1.f, 1.f);

	TArray<UMeshComponent*> Meshes;
	GetOwner()->GetComponents(Meshes);
	for (UMeshComponent* M : Meshes)
	{
		for (int32 i = 0; i < M->GetNumMaterials(); ++i)
		{
			Mids.Add(M->CreateAndSetMaterialInstanceDynamic(i));
		}
	}

	if (URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>())
	{
		T->OnStreetLightsChanged.AddDynamic(this, &URizeNightLightComponent::OnStreetLightsChanged);
		T->OnHourChanged.AddDynamic(this, &URizeNightLightComponent::OnHourChanged);
	}
	Evaluate();
}

void URizeNightLightComponent::OnStreetLightsChanged(bool bOn)
{
	// Hepsi aynı anda yanmasın: 0–8 sn rastgele gecikme (fotosel farkı)
	GetWorld()->GetTimerManager().SetTimer(DelayTimer, this, &URizeNightLightComponent::Evaluate, FMath::FRandRange(0.f, 8.f), false);
}

void URizeNightLightComponent::OnHourChanged(int32 Hour)
{
	if (Kind != ERizeLightKind::SokakLambasi) Evaluate();
}

void URizeNightLightComponent::Evaluate()
{
	const URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	if (!T) return;
	const bool bDark = T->AreStreetLightsOn();
	const double H = T->GetHour();

	bool bWant = bDark;
	if (Kind == ERizeLightKind::EvPenceresi)
	{
		// Akşam karanlıkta yanar, gece yarısından sonra söner, sabah ezanı vakti kısa süre yanar
		const double Off = HouseLightsOffHour + PersonalOffset + 24.0 * (HouseLightsOffHour < 12.0);
		const double HH = H < 12.0 ? H + 24.0 : H;
		const bool bEvening = bDark && HH < Off;
		const bool bMorning = bDark && H >= HouseMorningOnHour + 0.5 * PersonalOffset && H < 7.5;
		bWant = bEvening || bMorning;
	}
	else if (Kind == ERizeLightKind::DukkanTabela)
	{
		bWant = bDark && H >= 12.0; // kapanıştan sonra da tabela biraz yanar; gece yarısı söner
	}
	SetLit(bWant);
}

void URizeNightLightComponent::SetLit(bool bInLit)
{
	if (bInLit == bLit) return;
	bLit = bInLit;
	TArray<ULightComponent*> Lights;
	GetOwner()->GetComponents(Lights);
	for (ULightComponent* L : Lights) L->SetVisibility(bLit);
	for (UMaterialInstanceDynamic* M : Mids)
	{
		if (M) M->SetScalarParameterValue(EmissiveParameter, bLit ? EmissiveOn : 0.f);
	}
}
