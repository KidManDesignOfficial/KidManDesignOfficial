#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "RizeGameMode.generated.h"

/** Oyuncuyu seçtiği evin içinde (Ev_Sahil / Ev_Mahalle / Ev_Yayla etiketli PlayerStart) başlatır. */
UCLASS()
class RIZESIM_API ARizeGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ARizeGameMode();
	virtual AActor* ChoosePlayerStart_Implementation(AController* Player) override;
};
