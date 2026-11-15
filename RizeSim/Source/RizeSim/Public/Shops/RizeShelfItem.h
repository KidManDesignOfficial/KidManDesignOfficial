// Raftaki bir ürün yuvası. "E" sepete ekler, "Q" sepetten rafa geri koyar.
// Görünür ürün sayısı stokla eşleşir (ISM örnekleri gizlenir/gösterilir).

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeShelfItem.generated.h"

class ARizeShop;
class UInstancedStaticMeshComponent;
class USoundBase;

UCLASS()
class RIZESIM_API ARizeShelfItem : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeShelfItem();
	virtual void BeginPlay() override;

	UPROPERTY(EditInstanceOnly, Category = "Raf") TObjectPtr<ARizeShop> Shop;
	UPROPERTY(EditInstanceOnly, Category = "Raf") FName ProductId;
	/** Rafta yan yana dizili görünen azami adet. */
	UPROPERTY(EditAnywhere, Category = "Raf") int32 VisibleSlots = 6;
	UPROPERTY(EditAnywhere, Category = "Raf") FVector SlotSpacing = FVector(0, 12, 0);
	UPROPERTY(EditAnywhere, Category = "Raf") TObjectPtr<USoundBase> PickSound;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual FText GetSecondaryPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;
	virtual void InteractSecondary_Implementation(AActor* Interactor) override;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Raf") TObjectPtr<UInstancedStaticMeshComponent> Items;

private:
	void RefreshVisuals();
	FText ProductName() const;
};
