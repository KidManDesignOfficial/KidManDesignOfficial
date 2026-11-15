// Bir dükkanın dünyadaki temsili: kimliği JSON'daki tanıma bağlanır, çalışma
// saatlerini ve anlık stoğu tutar. Raflar, kasa ve servis tezgahı buna bağlanır.

#pragma once

#include "CoreMinimal.h"
#include "Data/RizeDataTypes.h"
#include "GameFramework/Actor.h"
#include "RizeShop.generated.h"

class UBoxComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FRizeOnShopOpenChanged, bool, bOpen);

UCLASS()
class RIZESIM_API ARizeShop : public AActor
{
	GENERATED_BODY()

public:
	ARizeShop();
	virtual void BeginPlay() override;

	/** shops.json içindeki kimlik, örn. "bakkal_tophane". */
	UPROPERTY(EditInstanceOnly, Category = "Dükkan") FName ShopId;

	UFUNCTION(BlueprintPure, Category = "Dükkan") bool IsOpenNow() const;
	UFUNCTION(BlueprintPure, Category = "Dükkan") FText GetDisplayName() const;
	/** "08:00'de açılır" / "Pazar kapalı" gibi metin. */
	UFUNCTION(BlueprintPure, Category = "Dükkan") FText GetOpeningHint() const;

	UFUNCTION(BlueprintPure, Category = "Dükkan") int32 GetStock(FName ProductId) const;
	UFUNCTION(BlueprintPure, Category = "Dükkan") int64 GetPrice(FName ProductId) const;
	bool TakeOne(FName ProductId);
	void ReturnStock(FName ProductId, int32 Quantity);

	const FRizeShopDef& GetDef() const { return Def; }

	UPROPERTY(BlueprintAssignable, Category = "Dükkan") FRizeOnShopOpenChanged OnOpenChanged;

protected:
	/** Dükkanın iç hacmi: oyuncu sepetiyle çıkarsa ürünler rafa döner (hırsızlık yok, nezaket var). */
	UPROPERTY(VisibleAnywhere, Category = "Dükkan") TObjectPtr<UBoxComponent> Interior;

	UFUNCTION() void OnHourChanged(int32 Hour);
	UFUNCTION() void OnInteriorEndOverlap(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex);

private:
	FRizeShopDef Def;
	TMap<FName, int32> Stock;
	bool bWasOpen = false;
	int32 LastRestockDay = -1;
};
