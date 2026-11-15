// Oyuncunun sürdüğü araç (Chaos tekerlekli fizik). FPS kokpit kamerası.
// Tutuş her karede hesaplanır: zemin tipi (asfalt / arnavut kaldırımı / beton /
// toprak) × ıslaklık × su birikintisi × lastik durumu → tekerlek sürtünmesi.
// Islak, dik bir Rize yokuşunda kalkış gerçekten zorlaşır.

#pragma once

#include "CoreMinimal.h"
#include "InputActionValue.h"
#include "Interaction/RizeInteractable.h"
#include "WheeledVehiclePawn.h"
#include "RizeDrivableVehicle.generated.h"

class ARizePlayerCharacter;
class UCameraComponent;
class UInputAction;
class UInputMappingContext;

UCLASS()
class RIZESIM_API ARizeDrivableVehicle : public AWheeledVehiclePawn, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeDrivableVehicle();
	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void NotifyControllerChanged() override;

	/** vehicles.json kimliği (galeriden alınırken atanır). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Araç") FName VehicleDefId;
	/** Oyuncuya ait değilse binilemez (park etmiş yabancı araçlar). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Araç") bool bOwnedByPlayer = false;

	/** 1 = yeni lastik, 0 = kel lastik. Tamircide yenilenir. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Araç|Bakım", meta = (ClampMin = 0, ClampMax = 1)) float TireCondition = 1.f;
	/** Genel bakım durumu (yağ, fren). Düşükse fren mesafesi uzar. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Araç|Bakım", meta = (ClampMin = 0, ClampMax = 1)) float ServiceCondition = 1.f;
	/** Kilometre sayacı (m). */
	UPROPERTY(BlueprintReadOnly, Category = "Araç|Bakım") double OdometerMeters = 0.0;

	UFUNCTION(BlueprintPure, Category = "Araç") float GetSpeedKmh() const;
	UFUNCTION(BlueprintPure, Category = "Araç") float GetCurrentGrip() const { return CurrentGrip; }
	UFUNCTION(BlueprintPure, Category = "Araç") bool IsOccupied() const { return Driver.IsValid(); }
	UFUNCTION(BlueprintCallable, Category = "Araç") void RestoreCondition() { TireCondition = 1.f; ServiceCondition = 1.f; }

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

	// ---- Girdi ----------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputMappingContext> DrivingMapping;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> ThrottleAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> BrakeAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> SteerAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> HandbrakeAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> LookAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> ExitAction;

	/** Lastik aşınması: metre başına kayıp (varsayılan ≈ 300 km'de biter; oyun ölçeği). */
	UPROPERTY(EditAnywhere, Category = "Araç|Bakım") float TireWearPerMeter = 1.f / 300000.f;
	UPROPERTY(EditAnywhere, Category = "Araç|Bakım") float ServiceWearPerMeter = 1.f / 500000.f;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Araç") TObjectPtr<UCameraComponent> CockpitCamera;
	/** Sürücü kapısı dışında iniş noktası. */
	UPROPERTY(VisibleAnywhere, Category = "Araç") TObjectPtr<USceneComponent> ExitPoint;

private:
	void OnThrottle(const FInputActionValue& V);
	void OnBrake(const FInputActionValue& V);
	void OnSteer(const FInputActionValue& V);
	void OnHandbrake(const FInputActionValue& V);
	void OnLook(const FInputActionValue& V);
	void OnExit();
	void UpdateGrip();

	TWeakObjectPtr<ARizePlayerCharacter> Driver;
	float CurrentGrip = 1.f;
	FRotator CockpitLook = FRotator::ZeroRotator;
};
