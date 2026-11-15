// Gerçek kapı: menteşeden açılır, içeri girilir. Bir dükkana bağlıysa
// dükkan kapalıyken kilitlidir ("Kapalı — 08:00'de açılır").

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeDoor.generated.h"

class ARizeShop;
class USoundBase;
class UStaticMeshComponent;

UCLASS()
class RIZESIM_API ARizeDoor : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeDoor();
	virtual void Tick(float DeltaSeconds) override;

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override { return true; }
	virtual void Interact_Implementation(AActor* Interactor) override;

	UPROPERTY(EditInstanceOnly, Category = "Kapı") TObjectPtr<ARizeShop> Shop;
	UPROPERTY(EditAnywhere, Category = "Kapı") float OpenAngle = 95.f;
	UPROPERTY(EditAnywhere, Category = "Kapı") float OpenSpeed = 3.f;
	/** Bu süre sonra kendiliğinden kapanır (0 = kapanmaz). Dükkan kapıları kendiliğinden kapanır. */
	UPROPERTY(EditAnywhere, Category = "Kapı") float AutoCloseSeconds = 6.f;
	UPROPERTY(EditAnywhere, Category = "Kapı") TObjectPtr<USoundBase> OpenSound;
	/** Dükkan kapısı zili ("çın çın"). */
	UPROPERTY(EditAnywhere, Category = "Kapı") TObjectPtr<USoundBase> BellSound;
	UPROPERTY(EditAnywhere, Category = "Kapı") TObjectPtr<USoundBase> LockedSound;

	UFUNCTION(BlueprintPure, Category = "Kapı") bool IsLocked() const;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Kapı") TObjectPtr<USceneComponent> Hinge;
	UPROPERTY(VisibleAnywhere, Category = "Kapı") TObjectPtr<UStaticMeshComponent> Panel;

private:
	bool bOpen = false;
	float CurrentAngle = 0.f;
	float OpenSign = 1.f;
	float OpenTimer = 0.f;
};
