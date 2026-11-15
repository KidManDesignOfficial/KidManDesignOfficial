// Dolmuş durağı. Oyuncu "E" ile beklemeye başlar (el kaldırır); NPC yolcular
// saat dilimine göre durakta birikir. Dolmuş yalnızca bekleyen varsa ya da
// içeriden "inecek var" denirse durur.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interaction/RizeInteractable.h"
#include "RizeDolmusStop.generated.h"

class UStaticMeshComponent;

UCLASS()
class RIZESIM_API ARizeDolmusStop : public AActor, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeDolmusStop();
	virtual void BeginPlay() override;

	/** dolmus_lines.json'daki durak kimliği. */
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Durak") FName StopId;
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Durak") FString DisplayName;
	/** Bu duraktan geçen hatlar. */
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Durak") TArray<FName> Lines;

	UFUNCTION(BlueprintPure, Category = "Durak") bool IsPlayerWaiting() const { return bPlayerWaiting; }
	UFUNCTION(BlueprintPure, Category = "Durak") int32 GetWaitingNpcCount() const { return WaitingNpcs; }
	void SetPlayerWaiting(bool bWaiting) { bPlayerWaiting = bWaiting; }
	/** Dolmuş bekleyen NPC'leri alır; alınan sayıyı döndürür. */
	int32 TakeNpcs(int32 MaxSeats);

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Durak") TObjectPtr<UStaticMeshComponent> Sign;

private:
	void AccumulatePassengers();
	bool bPlayerWaiting = false;
	int32 WaitingNpcs = 0;
	FTimerHandle Timer;
};
