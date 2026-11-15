// Sarı Rize dolmuşu (yapay zeka sürücülü). Hat güzergahında gider, bekleyen
// varsa durakta durur, yolcu indirip bindirir. Oyuncu durakta binip koltuğa
// oturur; camdan yokuşları ve denizi izler; "E" ile "İnecek var!" der.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeDolmus.generated.h"

class ARizeDolmusStop;
class ARizePlayerCharacter;
class UAudioComponent;
class URizeSplineFollowerComponent;
class USoundBase;
class UStaticMeshComponent;

UENUM(BlueprintType)
enum class ERizeDolmusState : uint8
{
	Driving     UMETA(DisplayName = "Yolda"),
	Dwelling    UMETA(DisplayName = "Durakta"),
	OutOfService UMETA(DisplayName = "Seferde değil")
};

USTRUCT()
struct FRizeLineStop
{
	GENERATED_BODY()
	UPROPERTY() TObjectPtr<ARizeDolmusStop> Stop;
	float DistanceCm = 0.f;
};

UCLASS()
class RIZESIM_API ARizeDolmus : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeDolmus();
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	/** Hat kimliği; güzergah ve ücret dolmus_lines.json'dan gelir. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Dolmuş") FName LineId;
	UPROPERTY(EditAnywhere, Category = "Dolmuş") int32 Seats = 14;
	UPROPERTY(EditAnywhere, Category = "Dolmuş") float DwellSeconds = 6.f;
	UPROPERTY(EditAnywhere, Category = "Dolmuş") TObjectPtr<USoundBase> DoorSound;

	UFUNCTION(BlueprintPure, Category = "Dolmuş") ERizeDolmusState GetState() const { return State; }
	UFUNCTION(BlueprintPure, Category = "Dolmuş") int32 GetPassengerCount() const { return NpcPassengers + (Player.IsValid() ? 1 : 0); }
	UFUNCTION(BlueprintPure, Category = "Dolmuş") FText GetNextStopName() const;

	/** Hat yöneticisi kurar: yolu ve başlangıç mesafesini verir. */
	void InitOnLine(FName InLineId, float StartDistanceCm);

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual bool CanInteract_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Dolmuş") TObjectPtr<UStaticMeshComponent> Body;
	UPROPERTY(VisibleAnywhere, Category = "Dolmuş") TObjectPtr<URizeSplineFollowerComponent> Follower;
	/** Oyuncunun oturduğu cam kenarı koltuk. */
	UPROPERTY(VisibleAnywhere, Category = "Dolmuş") TObjectPtr<USceneComponent> PlayerSeat;
	/** İnişte oyuncunun bırakıldığı kaldırım noktası (sağ kapı). */
	UPROPERTY(VisibleAnywhere, Category = "Dolmuş") TObjectPtr<USceneComponent> DoorPoint;
	UPROPERTY(VisibleAnywhere, Category = "Dolmuş") TObjectPtr<UAudioComponent> EngineAudio;

private:
	void ResolveStops();
	int32 NextStopIndex() const;
	bool ShouldStopAt(int32 StopIndex) const;
	bool IsInServiceHours() const;
	void ArriveAt(int32 StopIndex);
	void Depart();

	UPROPERTY() TArray<FRizeLineStop> Stops;
	TWeakObjectPtr<ARizePlayerCharacter> Player;
	ERizeDolmusState State = ERizeDolmusState::Driving;
	int32 TargetStop = -1;
	int32 LastServedStop = -1;
	int32 NpcPassengers = 0;
	bool bPlayerWantsOff = false;
	bool bNpcWantsOffNext = false;
	float DwellTimer = 0.f;
	int64 FareKurus = 0;
};
