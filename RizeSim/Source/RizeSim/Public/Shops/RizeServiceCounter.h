// Çay ocağı / kıraathane / esnaf lokantası tezgahı.
//   E → "Bir çay!" (varsayılan ürünü hemen söyle)
//   Q → menüyü aç (UMG OnMenuRequested'i dinler, seçimle Order() çağırır)
// Sipariş kısa bir bekleyişten sonra servis noktasına (masa) gelir.

#pragma once

#include "CoreMinimal.h"
#include "Data/RizeDataTypes.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeServiceCounter.generated.h"

class ARizePlayerCharacter;
class ARizeServiceCounter;
class UStaticMeshComponent;
class ARizeShop;
class USoundBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FRizeOnMenuRequested, ARizeServiceCounter*, Counter, const TArray<FRizeProductDef>&, Menu);

UCLASS()
class RIZESIM_API ARizeServiceCounter : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeServiceCounter();

	UPROPERTY(EditInstanceOnly, Category = "Servis") TObjectPtr<ARizeShop> Shop;
	/** "E" ile söylenen ürün, örn. "cay_ince_belli". */
	UPROPERTY(EditInstanceOnly, Category = "Servis") FName DefaultProduct;
	/** Ürün kimliği → masaya gelen görsel (ince belli bardak, kuru fasulye tabağı…). */
	UPROPERTY(EditAnywhere, Category = "Servis") TMap<FName, TSubclassOf<AActor>> ServedVisuals;
	UPROPERTY(EditAnywhere, Category = "Servis") float ServeDelaySeconds = 4.f;
	UPROPERTY(EditAnywhere, Category = "Servis") TObjectPtr<USoundBase> OrderSound;
	/** Söyleyen kim: diyalog havuzunda "cayci", "esnaf"… */
	UPROPERTY(EditAnywhere, Category = "Servis") FName StaffSpeaker = TEXT("cayci");

	UFUNCTION(BlueprintCallable, Category = "Servis") bool Order(ARizePlayerCharacter* Player, FName ProductId);
	UFUNCTION(BlueprintCallable, Category = "Servis") TArray<FRizeProductDef> GetMenu() const;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual FText GetSecondaryPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;
	virtual void InteractSecondary_Implementation(AActor* Interactor) override;

	UPROPERTY(BlueprintAssignable, Category = "Servis") FRizeOnMenuRequested OnMenuRequested;

protected:
	/** Tezgah gövdesi: etkileşim ışını buna çarpar. */
	UPROPERTY(VisibleAnywhere, Category = "Servis") TObjectPtr<UStaticMeshComponent> Counter;
	UPROPERTY(VisibleAnywhere, Category = "Servis") TObjectPtr<USceneComponent> ServePoint;

private:
	void Serve(FName ProductId, TWeakObjectPtr<ARizePlayerCharacter> Player);
	FText NameOf(FName ProductId) const;
};
