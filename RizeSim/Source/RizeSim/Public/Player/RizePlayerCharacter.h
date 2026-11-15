// Birinci şahıs oyuncu. Koşma/zıplama odaklı değil: yürüme, yavaş adım,
// etrafa bakma ve etkileşim. Dik merdivenlerde ve yokuşlarda adım hızı düşer.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "RizePlayerCharacter.generated.h"

class UCameraComponent;
class UInputAction;
class UInputMappingContext;
class URizeWalletComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FRizeOnFocusChanged, FText, Prompt, FText, SecondaryPrompt);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FRizeOnSubtitle, FText, Speaker, FText, Line);

UCLASS()
class RIZESIM_API ARizePlayerCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	ARizePlayerCharacter();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;
	virtual void NotifyControllerChanged() override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

	UFUNCTION(BlueprintPure, Category = "Rize") UCameraComponent* GetFirstPersonCamera() const { return Camera; }
	UFUNCTION(BlueprintPure, Category = "Rize") URizeWalletComponent* GetWallet() const { return Wallet; }
	UFUNCTION(BlueprintPure, Category = "Rize") AActor* GetFocusedActor() const { return FocusedActor.Get(); }

	/** Dolmuş koltuğu gibi bir yere oturt: hareket kapanır, bakış serbest kalır. */
	UFUNCTION(BlueprintCallable, Category = "Rize") void SitAt(USceneComponent* Seat);
	UFUNCTION(BlueprintCallable, Category = "Rize") void StandUpAt(const FVector& Location, const FRotator& Facing);
	UFUNCTION(BlueprintPure, Category = "Rize") bool IsSeated() const { return bSeated; }

	/** Altyazı / diyalog yayını; UMG bunu dinler. */
	UFUNCTION(BlueprintCallable, Category = "Rize") void ShowSubtitle(const FText& Speaker, const FText& Line);

	UPROPERTY(BlueprintAssignable, Category = "Rize") FRizeOnFocusChanged OnFocusChanged;
	UPROPERTY(BlueprintAssignable, Category = "Rize") FRizeOnSubtitle OnSubtitle;

	// ---- Girdi varlıkları (Blueprint alt sınıfında atanır) --------------
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputMappingContext> DefaultMapping;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> MoveAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> LookAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> InteractAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> SecondaryAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> BriskWalkAction;
	UPROPERTY(EditDefaultsOnly, Category = "Girdi") TObjectPtr<UInputAction> JumpAction;

	// ---- Yürüyüş ayarları ----------------------------------------------
	UPROPERTY(EditAnywhere, Category = "Yürüyüş") float StrollSpeed = 140.f;   // sakin yürüyüş (cm/s)
	UPROPERTY(EditAnywhere, Category = "Yürüyüş") float BriskSpeed = 260.f;    // hızlı adım (koşu değil)
	/** Yokuş yukarı hız kaybı: %30 eğimde hız bu oranla çarpılır. */
	UPROPERTY(EditAnywhere, Category = "Yürüyüş") float SteepUphillFactor = 0.6f;
	UPROPERTY(EditAnywhere, Category = "Yürüyüş") float InteractRange = 250.f;
	/** Kafa sallanması (yumuşak, mide bulandırmayan). 0 kapatır. */
	UPROPERTY(EditAnywhere, Category = "Yürüyüş") float HeadBobAmplitude = 1.2f;

private:
	void OnMove(const FInputActionValue& Value);
	void OnLook(const FInputActionValue& Value);
	void OnInteract();
	void OnSecondary();
	void OnBriskStart();
	void OnBriskStop();
	void UpdateFocus();
	void UpdateWalkFeel(float DeltaSeconds);

	UPROPERTY(VisibleAnywhere, Category = "Bileşenler") TObjectPtr<UCameraComponent> Camera;
	UPROPERTY(VisibleAnywhere, Category = "Bileşenler") TObjectPtr<URizeWalletComponent> Wallet;

	TWeakObjectPtr<AActor> FocusedActor;
	/** Oturulan aracın sahibi (dolmuş): oturuyken etkileşim ona gider. */
	TWeakObjectPtr<AActor> SeatOwner;
	FTimerHandle FocusTimer;
	bool bBrisk = false;
	bool bSeated = false;
	float BobPhase = 0.f;
	FVector CameraBaseOffset = FVector(0, 0, 64.f);
};
