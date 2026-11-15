// Kasa: sepetteki ürünlerin ödemesi. Esnaf NPC'si "Hayırlı olsun" der.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeCashRegister.generated.h"

class ARizeShop;
class USoundBase;
class UStaticMeshComponent;

UCLASS()
class RIZESIM_API ARizeCashRegister : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeCashRegister();

	UPROPERTY(EditInstanceOnly, Category = "Kasa") TObjectPtr<ARizeShop> Shop;
	UPROPERTY(EditAnywhere, Category = "Kasa") TObjectPtr<USoundBase> RegisterSound;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Kasa") TObjectPtr<UStaticMeshComponent> Mesh;
};
