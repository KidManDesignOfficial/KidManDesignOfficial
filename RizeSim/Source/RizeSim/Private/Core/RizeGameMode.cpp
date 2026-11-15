#include "Core/RizeGameMode.h"

#include "Core/RizeGameInstance.h"
#include "Core/RizePlayerController.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerStart.h"
#include "Player/RizePlayerCharacter.h"

ARizeGameMode::ARizeGameMode()
{
	DefaultPawnClass = ARizePlayerCharacter::StaticClass();
	PlayerControllerClass = ARizePlayerController::StaticClass();
}

AActor* ARizeGameMode::ChoosePlayerStart_Implementation(AController* Player)
{
	const URizeGameInstance* GI = GetGameInstance<URizeGameInstance>();
	const FName Tag = URizeGameInstance::PlayerStartTagFor(GI ? GI->Home : ERizeHome::MahalleEvi);
	for (TActorIterator<APlayerStart> It(GetWorld()); It; ++It)
	{
		if (It->PlayerStartTag == Tag) return *It;
	}
	return Super::ChoosePlayerStart_Implementation(Player);
}
