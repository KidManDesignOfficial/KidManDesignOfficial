#include "Vehicles/RizeVehicleShops.h"

#include "Components/BoxComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Core/RizeGameInstance.h"
#include "Core/RizeTypes.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/World.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Shops/RizeShop.h"
#include "Vehicles/RizeDrivableVehicle.h"

#define LOCTEXT_NAMESPACE "RizeVehicleShops"

namespace
{
	const FRizeVehicleDef* FindDef(const UObject* Ctx, FName Id)
	{
		const UGameInstance* GI = Ctx->GetWorld() ? Ctx->GetWorld()->GetGameInstance() : nullptr;
		const URizeDataSubsystem* Data = GI ? GI->GetSubsystem<URizeDataSubsystem>() : nullptr;
		return Data ? Data->FindVehicle(Id) : nullptr;
	}
	FText Money(int64 K) { return FText::FromString(RizeConv::FromStd(RizeSim::FormatTL(K))); }
}

// ---------------------------------------------------------------- Galeri

ARizeDealerSpot::ARizeDealerSpot()
{
	Platform = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Platform"));
	RootComponent = Platform;
}

bool ARizeDealerSpot::CanInteract_Implementation(AActor* Interactor) const
{
	return FindDef(this, VehicleDefId) != nullptr && (!Shop || Shop->IsOpenNow());
}

FText ARizeDealerSpot::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	const FRizeVehicleDef* D = FindDef(this, VehicleDefId);
	if (!D) return FText::GetEmpty();
	return FText::Format(LOCTEXT("Buy", "Satın al: {0} — {1}"), FText::FromString(D->Name), Money(D->PriceKurus));
}

FText ARizeDealerSpot::GetSecondaryPrompt_Implementation(AActor* Interactor) const
{
	return LOCTEXT("Inspect", "İncele");
}

void ARizeDealerSpot::InteractSecondary_Implementation(AActor* Interactor)
{
	const FRizeVehicleDef* D = FindDef(this, VehicleDefId);
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!D || !P) return;
	P->ShowSubtitle(LOCTEXT("Dealer", "Galerici"),
		FText::Format(LOCTEXT("Pitch", "{0}. Bu yokuşlar için birebir, yağmurda da yol tutar. Yıllık bakımı {1}."),
			FText::FromString(D->Name), Money(D->ServiceKurus)));
}

void ARizeDealerSpot::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	const FRizeVehicleDef* D = FindDef(this, VehicleDefId);
	if (!P || !D || !P->GetWallet()) return;

	UClass* Cls = LoadClass<ARizeDrivableVehicle>(nullptr, *D->VehicleClass);
	if (!Cls)
	{
		P->ShowSubtitle(LOCTEXT("Dealer", "Galerici"), LOCTEXT("NotReady", "Bu araç henüz gelmedi, sonra uğra."));
		return;
	}
	if (!P->GetWallet()->Pay(D->PriceKurus))
	{
		P->ShowSubtitle(LOCTEXT("Dealer", "Galerici"), LOCTEXT("NoMoney", "Biraz daha biriktir, sana uygun fiyat yaparız."));
		return;
	}

	const FTransform Where = DeliveryPoint ? DeliveryPoint->GetActorTransform() : GetActorTransform();
	FActorSpawnParameters SP;
	SP.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
	if (ARizeDrivableVehicle* V = GetWorld()->SpawnActor<ARizeDrivableVehicle>(Cls, Where, SP))
	{
		V->VehicleDefId = VehicleDefId;
		V->bOwnedByPlayer = true;
		if (URizeGameInstance* GI = GetWorld()->GetGameInstance<URizeGameInstance>()) GI->OwnedVehicles.AddUnique(VehicleDefId);
		P->ShowSubtitle(LOCTEXT("Dealer", "Galerici"), LOCTEXT("Sold", "Hayırlı olsun! Anahtarlar sende, araç kapının önünde."));
	}
}

// ---------------------------------------------------------------- Tamirci

ARizeRepairBay::ARizeRepairBay()
{
	Bay = CreateDefaultSubobject<UBoxComponent>(TEXT("Bay"));
	Bay->SetBoxExtent(FVector(350, 180, 150));
	Bay->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	RootComponent = Bay;
	Desk = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Desk"));
	Desk->SetupAttachment(Bay);
}

ARizeDrivableVehicle* ARizeRepairBay::VehicleInBay() const
{
	TArray<AActor*> Overlaps;
	Bay->GetOverlappingActors(Overlaps, ARizeDrivableVehicle::StaticClass());
	for (AActor* A : Overlaps)
	{
		ARizeDrivableVehicle* V = Cast<ARizeDrivableVehicle>(A);
		if (V && V->bOwnedByPlayer && !V->IsOccupied()) return V;
	}
	return nullptr;
}

int64 ARizeRepairBay::QuoteFor(const ARizeDrivableVehicle* V) const
{
	const FRizeVehicleDef* D = FindDef(this, V->VehicleDefId);
	const int64 Full = D && D->ServiceKurus > 0 ? D->ServiceKurus : 350000; // tanımsızsa 3.500 TL
	const float Need = 0.6f * (1.f - V->TireCondition) + 0.4f * (1.f - V->ServiceCondition);
	return FMath::Max<int64>(25000, (int64)(Full * Need)); // asgari işçilik 250 TL
}

bool ARizeRepairBay::CanInteract_Implementation(AActor* Interactor) const
{
	return VehicleInBay() != nullptr && (!Shop || Shop->IsOpenNow());
}

FText ARizeRepairBay::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	const ARizeDrivableVehicle* V = VehicleInBay();
	if (!V) return FText::GetEmpty();
	return FText::Format(LOCTEXT("Service", "Bakım yaptır (lastik %{0}, genel %{1}) — {2}"),
		FMath::RoundToInt(V->TireCondition * 100.f), FMath::RoundToInt(V->ServiceCondition * 100.f), Money(QuoteFor(V)));
}

void ARizeRepairBay::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	ARizeDrivableVehicle* V = VehicleInBay();
	if (!P || !V || !P->GetWallet()) return;
	if (!P->GetWallet()->Pay(QuoteFor(V)))
	{
		P->ShowSubtitle(LOCTEXT("Mechanic", "Usta"), LOCTEXT("NoMoney", "Parçayı getirtirim ama peşin lazım."));
		return;
	}
	V->RestoreCondition();
	P->ShowSubtitle(LOCTEXT("Mechanic", "Usta"), LOCTEXT("Done", "Lastikleri değiştirdik, yağı da baktık. Yağmurda dikkat et yine de."));
}

#undef LOCTEXT_NAMESPACE
