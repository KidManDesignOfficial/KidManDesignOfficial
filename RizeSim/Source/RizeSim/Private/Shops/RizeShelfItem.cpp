#include "Shops/RizeShelfItem.h"

#include "Components/InstancedStaticMeshComponent.h"
#include "Core/RizeTypes.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "Kismet/GameplayStatics.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Shops/RizeShop.h"

#define LOCTEXT_NAMESPACE "RizeShelf"

ARizeShelfItem::ARizeShelfItem()
{
	Items = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("Items"));
	RootComponent = Items;
	Items->SetCollisionProfileName(TEXT("BlockAllDynamic"));
}

void ARizeShelfItem::BeginPlay()
{
	Super::BeginPlay();
	RefreshVisuals();
}

FText ARizeShelfItem::ProductName() const
{
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeProductDef* P = Data ? Data->FindProduct(ProductId) : nullptr;
	return P ? FText::FromString(P->Name) : FText::FromName(ProductId);
}

bool ARizeShelfItem::CanInteract_Implementation(AActor* Interactor) const
{
	return Shop != nullptr;
}

FText ARizeShelfItem::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	if (!Shop) return FText::GetEmpty();
	if (Shop->GetStock(ProductId) <= 0) return FText::Format(LOCTEXT("OutOfStock", "{0} — tükendi"), ProductName());
	const FString Price = RizeConv::FromStd(RizeSim::FormatTL(Shop->GetPrice(ProductId)));
	return FText::Format(LOCTEXT("Take", "Sepete ekle: {0} — {1}"), ProductName(), FText::FromString(Price));
}

FText ARizeShelfItem::GetSecondaryPrompt_Implementation(AActor* Interactor) const
{
	const ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (P && P->GetWallet() && P->GetWallet()->CartCountOf(ProductId) > 0)
	{
		return FText::Format(LOCTEXT("PutBack", "Rafa geri koy (sepette {0})"), P->GetWallet()->CartCountOf(ProductId));
	}
	return FText::GetEmpty();
}

void ARizeShelfItem::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P || !Shop || !P->GetWallet()) return;
	URizeWalletComponent* W = P->GetWallet();

	// Başka dükkanın sepetiyle buraya gelindiyse önce o sepet bırakılmış olmalı
	if (!W->CartShopId.IsNone() && W->CartShopId != Shop->ShopId)
	{
		P->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("OtherCart", "Elindeki sepet başka dükkanın, önce onu bırak."));
		return;
	}
	if (!Shop->TakeOne(ProductId)) return;

	W->AddToCart(Shop->ShopId, ProductId, Shop->GetPrice(ProductId));
	if (PickSound) UGameplayStatics::PlaySoundAtLocation(this, PickSound, GetActorLocation());
	RefreshVisuals();
}

void ARizeShelfItem::InteractSecondary_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	if (!P || !Shop || !P->GetWallet()) return;
	if (P->GetWallet()->RemoveFromCart(ProductId, 1) > 0)
	{
		Shop->ReturnStock(ProductId, 1);
		RefreshVisuals();
	}
}

void ARizeShelfItem::RefreshVisuals()
{
	if (!Items || !Items->GetStaticMesh()) return;
	const int32 Count = Shop ? FMath::Min(Shop->GetStock(ProductId), VisibleSlots) : VisibleSlots;
	Items->ClearInstances();
	for (int32 i = 0; i < Count; ++i)
	{
		Items->AddInstance(FTransform(SlotSpacing * (float)i));
	}
}

#undef LOCTEXT_NAMESPACE
