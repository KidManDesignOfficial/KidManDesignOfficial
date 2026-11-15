// Oyuncunun cüzdanı, alışveriş sepeti ve çantası.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Sim/RizeEconomy.h"
#include "RizeWalletComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FRizeOnMoneyChanged, int64, NewBalanceKurus);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FRizeOnCartChanged);

USTRUCT(BlueprintType)
struct FRizeCartLineView
{
	GENERATED_BODY()
	UPROPERTY(BlueprintReadOnly, Category = "Rize") FName ProductId;
	UPROPERTY(BlueprintReadOnly, Category = "Rize") FText DisplayName;
	UPROPERTY(BlueprintReadOnly, Category = "Rize") int32 Quantity = 0;
	UPROPERTY(BlueprintReadOnly, Category = "Rize") int64 LineTotalKurus = 0;
};

UENUM(BlueprintType)
enum class ERizeCheckoutResult : uint8
{
	Ok,
	EmptyCart          UMETA(DisplayName = "Sepet boş"),
	InsufficientFunds  UMETA(DisplayName = "Para yetmiyor"),
	ShopClosed         UMETA(DisplayName = "Dükkan kapalı")
};

UCLASS(ClassGroup = (Rize), meta = (BlueprintSpawnableComponent))
class RIZESIM_API URizeWalletComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	// ---- Para -----------------------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Cüzdan")
	int64 BalanceKurus = 150000; // başlangıç: 1.500,00 TL

	UFUNCTION(BlueprintPure, Category = "Rize|Cüzdan") FText GetBalanceText() const;
	UFUNCTION(BlueprintCallable, Category = "Rize|Cüzdan") bool Pay(int64 AmountKurus);
	UFUNCTION(BlueprintCallable, Category = "Rize|Cüzdan") void Receive(int64 AmountKurus);

	// ---- Sepet (bir dükkana bağlı) ---------------------------------------
	/** Sepet hangi dükkana ait. Başka dükkana girince sepet o dükkanın rafına iade edilir. */
	UPROPERTY(BlueprintReadOnly, Category = "Rize|Sepet") FName CartShopId;

	void AddToCart(FName ShopId, FName ProductId, int64 UnitPriceKurus);
	int32 RemoveFromCart(FName ProductId, int32 Quantity = 1);
	ERizeCheckoutResult Checkout(bool bShopOpen);

	UFUNCTION(BlueprintPure, Category = "Rize|Sepet") int32 CartCountOf(FName ProductId) const;
	UFUNCTION(BlueprintPure, Category = "Rize|Sepet") int64 CartTotalKurus() const { return Cart.Total(); }
	UFUNCTION(BlueprintPure, Category = "Rize|Sepet") bool IsCartEmpty() const { return Cart.IsEmpty(); }
	UFUNCTION(BlueprintCallable, Category = "Rize|Sepet") TArray<FRizeCartLineView> GetCartLines() const;
	const RizeSim::FCart& GetCart() const { return Cart; }
	void ClearCart() { Cart.Clear(); CartShopId = NAME_None; OnCartChanged.Broadcast(); }

	// ---- Çanta ----------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, Category = "Rize|Çanta") TMap<FName, int32> Inventory;

	UPROPERTY(BlueprintAssignable, Category = "Rize|Cüzdan") FRizeOnMoneyChanged OnMoneyChanged;
	UPROPERTY(BlueprintAssignable, Category = "Rize|Sepet") FRizeOnCartChanged OnCartChanged;

private:
	RizeSim::FCart Cart;
};
