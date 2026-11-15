#include "Player/RizeWalletComponent.h"

#include "Core/RizeTypes.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"

FText URizeWalletComponent::GetBalanceText() const
{
	return FText::FromString(RizeConv::FromStd(RizeSim::FormatTL(BalanceKurus)));
}

bool URizeWalletComponent::Pay(int64 AmountKurus)
{
	if (AmountKurus < 0 || AmountKurus > BalanceKurus) return false;
	BalanceKurus -= AmountKurus;
	OnMoneyChanged.Broadcast(BalanceKurus);
	return true;
}

void URizeWalletComponent::Receive(int64 AmountKurus)
{
	if (AmountKurus <= 0) return;
	BalanceKurus += AmountKurus;
	OnMoneyChanged.Broadcast(BalanceKurus);
}

void URizeWalletComponent::AddToCart(FName ShopId, FName ProductId, int64 UnitPriceKurus)
{
	CartShopId = ShopId;
	Cart.Add(RizeConv::ToStd(ProductId.ToString()), UnitPriceKurus, 1);
	OnCartChanged.Broadcast();
}

int32 URizeWalletComponent::RemoveFromCart(FName ProductId, int32 Quantity)
{
	const int32 Removed = Cart.Remove(RizeConv::ToStd(ProductId.ToString()), Quantity);
	if (Cart.IsEmpty()) CartShopId = NAME_None;
	if (Removed > 0) OnCartChanged.Broadcast();
	return Removed;
}

int32 URizeWalletComponent::CartCountOf(FName ProductId) const
{
	return Cart.CountOf(RizeConv::ToStd(ProductId.ToString()));
}

ERizeCheckoutResult URizeWalletComponent::Checkout(bool bShopOpen)
{
	// Satın alınanları çantaya taşımak için sepet satırlarını önceden kopyala
	const std::vector<RizeSim::FCartLine> Bought = Cart.GetLines();
	RizeSim::FKurus Balance = BalanceKurus;
	const RizeSim::ECheckoutResult R = Cart.Checkout(Balance, bShopOpen);
	if (R == RizeSim::ECheckoutResult::Ok)
	{
		BalanceKurus = Balance;
		for (const RizeSim::FCartLine& L : Bought)
		{
			Inventory.FindOrAdd(FName(RizeConv::FromStd(L.ProductId))) += L.Quantity;
		}
		CartShopId = NAME_None;
		OnMoneyChanged.Broadcast(BalanceKurus);
		OnCartChanged.Broadcast();
	}
	return (ERizeCheckoutResult)(uint8)R;
}

TArray<FRizeCartLineView> URizeWalletComponent::GetCartLines() const
{
	TArray<FRizeCartLineView> Out;
	const URizeDataSubsystem* Data = GetWorld() && GetWorld()->GetGameInstance()
		? GetWorld()->GetGameInstance()->GetSubsystem<URizeDataSubsystem>() : nullptr;
	for (const RizeSim::FCartLine& L : Cart.GetLines())
	{
		FRizeCartLineView V;
		V.ProductId = FName(RizeConv::FromStd(L.ProductId));
		V.Quantity = L.Quantity;
		V.LineTotalKurus = L.LineTotal();
		const FRizeProductDef* P = Data ? Data->FindProduct(V.ProductId) : nullptr;
		V.DisplayName = P ? FText::FromString(P->Name) : FText::FromName(V.ProductId);
		Out.Add(V);
	}
	return Out;
}
