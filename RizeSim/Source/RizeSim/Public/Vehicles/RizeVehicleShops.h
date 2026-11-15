// Oto galeri ve tamirci.
//   ARizeDealerSpot  : galeride sergilenen bir araç; incele, satın al, park yerine teslim.
//   ARizeRepairBay   : tamirci çukuru; içindeki oyuncu aracına bakım (lastik + genel).

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeVehicleShops.generated.h"

class ARizeDrivableVehicle;
class ARizeShop;
class UBoxComponent;
class UStaticMeshComponent;

UCLASS()
class RIZESIM_API ARizeDealerSpot : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeDealerSpot();

	UPROPERTY(EditInstanceOnly, Category = "Galeri") TObjectPtr<ARizeShop> Shop;
	/** vehicles.json kimliği. */
	UPROPERTY(EditInstanceOnly, Category = "Galeri") FName VehicleDefId;
	/** Satın alınan araç buraya teslim edilir (galeri önündeki park yeri). */
	UPROPERTY(EditInstanceOnly, Category = "Galeri") TObjectPtr<AActor> DeliveryPoint;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual FText GetSecondaryPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;
	virtual void InteractSecondary_Implementation(AActor* Interactor) override;

protected:
	/** Sergileme platformu (araç modeli Blueprint'te yerleştirilir). */
	UPROPERTY(VisibleAnywhere, Category = "Galeri") TObjectPtr<UStaticMeshComponent> Platform;
};

UCLASS()
class RIZESIM_API ARizeRepairBay : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeRepairBay();

	UPROPERTY(EditInstanceOnly, Category = "Tamirci") TObjectPtr<ARizeShop> Shop;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Tamirci") TObjectPtr<UBoxComponent> Bay;
	UPROPERTY(VisibleAnywhere, Category = "Tamirci") TObjectPtr<UStaticMeshComponent> Desk;

private:
	ARizeDrivableVehicle* VehicleInBay() const;
	int64 QuoteFor(const ARizeDrivableVehicle* V) const;
};
