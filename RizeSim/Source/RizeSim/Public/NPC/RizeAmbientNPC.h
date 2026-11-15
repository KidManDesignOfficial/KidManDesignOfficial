// Yaşayan şehir sakini. Günlük programı (schedules.json) saatine göre bir
// konuma yürür, orada bir duruş alır (çay içer, okey oynar, tezgahta durur).
// Oyuncu konuşunca bağlama uygun bir replik söyler (dialogue.json).

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "GameFramework/Character.h"
#include "Interaction/RizeInteractable.h"
#include "RizeAmbientNPC.generated.h"

class ARizeLocationMarker;

UCLASS()
class RIZESIM_API ARizeAmbientNPC : public ACharacter, public IRizeInteractable
{
	GENERATED_BODY()

public:
	ARizeAmbientNPC();
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type Reason) override;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "NPC") FString DisplayName = TEXT("Komşu");
	/** schedules.json kimliği. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "NPC") FName ScheduleId;
	/** dialogue.json "speaker" alanı: esnaf, cayci, yasli, genc… */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "NPC") FName SpeakerType = TEXT("herkes");
	UPROPERTY(EditAnywhere, Category = "NPC") float WalkSpeed = 120.f;

	UFUNCTION(BlueprintPure, Category = "NPC") FName GetCurrentActivity() const { return CurrentActivity; }
	UFUNCTION(BlueprintPure, Category = "NPC") FName GetCurrentPose() const;
	UFUNCTION(BlueprintPure, Category = "NPC") bool HasArrived() const { return bArrived; }

	/** Blueprint: varışta duruş animasyonu, yağmurda şemsiye açma vb. */
	UFUNCTION(BlueprintImplementableEvent, Category = "NPC") void OnActivityStarted(FName Activity, FName Pose);
	UFUNCTION(BlueprintImplementableEvent, Category = "NPC") void OnWeatherReaction(bool bRaining);

	virtual FText GetInteractionPrompt_Implementation(AActor* Interactor) const override;
	virtual void Interact_Implementation(AActor* Interactor) override;

private:
	UFUNCTION() void OnHourChanged(int32 Hour);
	UFUNCTION() void OnWeatherChanged(ERizeWeather OldWeather, ERizeWeather NewWeather);
	void Reevaluate();
	void CheckArrival();

	FName CurrentActivity;
	TWeakObjectPtr<ARizeLocationMarker> Target;
	bool bArrived = false;
	FTimerHandle ArrivalTimer;
	double LastTalkTime = -100.0;
};
