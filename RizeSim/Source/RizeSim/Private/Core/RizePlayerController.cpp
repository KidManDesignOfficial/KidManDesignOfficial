#include "Core/RizePlayerController.h"

#include "Core/RizeGameInstance.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/Engine.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Time/RizeTimeSubsystem.h"
#include "Weather/RizeWeatherSubsystem.h"

ARizePlayerController::ARizePlayerController()
{
	CheatClass = URizeCheatManager::StaticClass();
}

void URizeCheatManager::RizeSaat(float Hour)
{
	if (URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>()) T->SetTimeOfDay(Hour);
}

void URizeCheatManager::RizeHizi(float TimeScale)
{
	if (URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>()) T->SetTimeScale(TimeScale);
}

void URizeCheatManager::RizeHava(const FString& Weather)
{
	URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	const UEnum* E = StaticEnum<ERizeWeather>();
	const int64 V = E->GetValueByNameString(Weather);
	if (W && V != INDEX_NONE) W->ForceWeather((ERizeWeather)V, false);
}

void URizeCheatManager::RizePara(int32 Lira)
{
	if (ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(GetOuterAPlayerController()->GetPawn()))
	{
		P->GetWallet()->Receive((int64)Lira * 100);
	}
}

void URizeCheatManager::RizeKaydet()
{
	if (URizeGameInstance* GI = GetWorld()->GetGameInstance<URizeGameInstance>()) GI->SaveNow();
}

void URizeCheatManager::RizeYukle()
{
	if (URizeGameInstance* GI = GetWorld()->GetGameInstance<URizeGameInstance>()) GI->LoadAndApply();
}

void URizeCheatManager::RizeVeriYenile()
{
	if (URizeDataSubsystem* D = GetWorld()->GetGameInstance()->GetSubsystem<URizeDataSubsystem>()) D->Reload();
}

void URizeCheatManager::RizeDurum()
{
	const URizeTimeSubsystem* T = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const URizeWeatherSubsystem* W = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	if (!T || !W || !GEngine) return;
	const FString Msg = FString::Printf(TEXT("Gün %d %s | %s | Güneş %.1f° | Hava %s | Yağış %.2f Sis %.2f Islaklık %.2f Birikinti %.2f"),
		T->GetDay() + 1, *T->GetClockText().ToString(), *UEnum::GetDisplayValueAsText(T->GetPhase()).ToString(),
		T->GetSunElevationDeg(), *UEnum::GetDisplayValueAsText(W->GetWeather()).ToString(),
		W->GetRain(), W->GetFog(), W->GetWetness(), W->GetPuddles());
	GEngine->AddOnScreenDebugMessage(-1, 8.f, FColor::Yellow, Msg);
}
