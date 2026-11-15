// NPC programlarının hedef noktası: "kiraathane_masa", "sahil_parki", "bakkal_tezgah"…
// Aynı etiketten birden çok olabilir; NPC boş olanı seçer.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RizeLocationMarker.generated.h"

UCLASS()
class RIZESIM_API ARizeLocationMarker : public AActor
{
	GENERATED_BODY()

public:
	ARizeLocationMarker();

	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Konum") FName LocationTag;
	/** Varışta oynatılacak duruş: oturma, ayakta sohbet, tezgah arkası… (BP animasyon seçer). */
	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Konum") FName Pose;
	/** Bu noktayı kullanan NPC (rezervasyon). */
	TWeakObjectPtr<AActor> Occupant;

	static ARizeLocationMarker* FindFree(UWorld* World, FName Tag, const FVector& Near, AActor* For);
};
