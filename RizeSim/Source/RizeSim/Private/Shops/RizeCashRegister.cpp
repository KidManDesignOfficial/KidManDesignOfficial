#include "Shops/RizeCashRegister.h"

#include "Components/StaticMeshComponent.h"
#include "Core/RizeTypes.h"
#include "Kismet/GameplayStatics.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Shops/RizeShop.h"

#define LOCTEXT_NAMESPACE "RizeRegister"

ARizeCashRegister::ARizeCashRegister()
{
	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	RootComponent = Mesh;
}

bool ARizeCashRegister::CanInteract_Implementation(AActor* Interactor) const
{
	const ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	return Shop && P && P->GetWallet() && !P->GetWallet()->IsCartEmpty() && P->GetWallet()->CartShopId == Shop->ShopId;
}

FText ARizeCashRegister::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	const ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P || !P->GetWallet()) return FText::GetEmpty();
	const FString Total = RizeConv::FromStd(RizeSim::FormatTL(P->GetWallet()->CartTotalKurus()));
	return FText::Format(LOCTEXT("Pay", "Öde: {0}"), FText::FromString(Total));
}

void ARizeCashRegister::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P || !Shop || !P->GetWallet()) return;

	switch (P->GetWallet()->Checkout(Shop->IsOpenNow()))
	{
	case ERizeCheckoutResult::Ok:
		if (RegisterSound) UGameplayStatics::PlaySoundAtLocation(this, RegisterSound, GetActorLocation());
		P->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("Thanks", "Hayırlı olsun, yine bekleriz."));
		break;
	case ERizeCheckoutResult::InsufficientFunds:
		P->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("NoMoney", "Hesap biraz tuttu ha… Birkaç şeyi rafa bırakalım mı?"));
		break;
	case ERizeCheckoutResult::ShopClosed:
		P->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("Closed", "Kusura bakma, kapattık. Yarın gel."));
		break;
	default:
		break;
	}
}

#undef LOCTEXT_NAMESPACE
