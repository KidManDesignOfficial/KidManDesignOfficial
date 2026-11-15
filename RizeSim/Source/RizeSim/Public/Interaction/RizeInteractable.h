// Oyuncunun baktığı ve "E" ile etkileşime girdiği her şey: kapılar, raflar,
// kasa, çay ocağı tezgahı, dolmuş durağı, araçlar, NPC'ler.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "RizeInteractable.generated.h"

UINTERFACE(MinimalAPI, Blueprintable)
class URizeInteractable : public UInterface
{
	GENERATED_BODY()
};

class RIZESIM_API IRizeInteractable
{
	GENERATED_BODY()

public:
	/** Ekranda gösterilecek kısa ipucu, örn. "Kapıyı aç", "Al: Rize Çayı — 285,00 TL". */
	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Rize|Etkileşim")
	FText GetInteractionPrompt(AActor* Interactor) const;

	/** İkincil eylem ipucu (boşsa gösterilmez), örn. "Rafa geri koy". */
	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Rize|Etkileşim")
	FText GetSecondaryPrompt(AActor* Interactor) const;

	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Rize|Etkileşim")
	bool CanInteract(AActor* Interactor) const;

	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Rize|Etkileşim")
	void Interact(AActor* Interactor);

	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Rize|Etkileşim")
	void InteractSecondary(AActor* Interactor);
};
