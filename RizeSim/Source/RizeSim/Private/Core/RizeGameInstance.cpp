#include "Core/RizeGameInstance.h"

#include "Kismet/GameplayStatics.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "RizeSim.h"
#include "Time/RizeTimeSubsystem.h"
#include "Weather/RizeWeatherSubsystem.h"

FName URizeGameInstance::PlayerStartTagFor(ERizeHome H)
{
	switch (H)
	{
	case ERizeHome::SahilDairesi: return TEXT("Ev_Sahil");
	case ERizeHome::YaylaEvi:     return TEXT("Ev_Yayla");
	default:                      return TEXT("Ev_Mahalle");
	}
}

bool URizeGameInstance::HasSave() const
{
	return UGameplayStatics::DoesSaveGameExist(SlotName(), 0);
}

bool URizeGameInstance::SaveNow()
{
	UWorld* World = GetWorld();
	URizeSaveGame* S = Cast<URizeSaveGame>(UGameplayStatics::CreateSaveGameObject(URizeSaveGame::StaticClass()));
	if (!World || !S) return false;

	S->Home = Home;
	S->OwnedVehicles = OwnedVehicles;
	if (const URizeTimeSubsystem* T = World->GetSubsystem<URizeTimeSubsystem>())
	{
		S->Day = T->GetDay();
		S->Hour = T->GetHour();
	}
	if (const URizeWeatherSubsystem* W = World->GetSubsystem<URizeWeatherSubsystem>())
	{
		S->Weather = W->GetWeather();
		S->WeatherRng = W->GetRngState();
	}
	if (const ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(UGameplayStatics::GetPlayerPawn(World, 0)))
	{
		S->BalanceKurus = P->GetWallet()->BalanceKurus;
		S->Inventory = P->GetWallet()->Inventory;
		S->PlayerTransform = P->GetActorTransform();
	}
	const bool bOk = UGameplayStatics::SaveGameToSlot(S, SlotName(), 0);
	UE_LOG(LogRize, Log, TEXT("Kayıt %s"), bOk ? TEXT("başarılı") : TEXT("BAŞARISIZ"));
	return bOk;
}

bool URizeGameInstance::LoadAndApply()
{
	URizeSaveGame* S = Cast<URizeSaveGame>(UGameplayStatics::LoadGameFromSlot(SlotName(), 0));
	UWorld* World = GetWorld();
	if (!S || !World) return false;

	Home = S->Home;
	OwnedVehicles = S->OwnedVehicles;
	if (URizeTimeSubsystem* T = World->GetSubsystem<URizeTimeSubsystem>()) T->SetDayAndHour(S->Day, S->Hour);
	if (URizeWeatherSubsystem* W = World->GetSubsystem<URizeWeatherSubsystem>()) W->RestoreState(S->Weather, S->WeatherRng);
	if (ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(UGameplayStatics::GetPlayerPawn(World, 0)))
	{
		P->GetWallet()->BalanceKurus = S->BalanceKurus;
		P->GetWallet()->Inventory = S->Inventory;
		P->SetActorTransform(S->PlayerTransform, false, nullptr, ETeleportType::TeleportPhysics);
		P->GetWallet()->OnMoneyChanged.Broadcast(S->BalanceKurus);
	}
	return true;
}
