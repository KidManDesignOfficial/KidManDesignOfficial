// Oturumlar arası kalıcı durum: ev seçimi, sahip olunan araçlar, kayıt/yükleme.

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "Engine/GameInstance.h"
#include "GameFramework/SaveGame.h"
#include "RizeGameInstance.generated.h"

UCLASS()
class RIZESIM_API URizeSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	UPROPERTY() int32 Version = 1;
	UPROPERTY() ERizeHome Home = ERizeHome::MahalleEvi;
	UPROPERTY() int64 BalanceKurus = 0;
	UPROPERTY() TMap<FName, int32> Inventory;
	UPROPERTY() int32 Day = 0;
	UPROPERTY() double Hour = 7.0;
	UPROPERTY() ERizeWeather Weather = ERizeWeather::Bulutlu;
	UPROPERTY() int64 WeatherRng = 0;
	UPROPERTY() TArray<FName> OwnedVehicles;
	UPROPERTY() FTransform PlayerTransform;
};

UCLASS()
class RIZESIM_API URizeGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	UPROPERTY(BlueprintReadWrite, Category = "Rize") ERizeHome Home = ERizeHome::MahalleEvi;
	UPROPERTY(BlueprintReadWrite, Category = "Rize") TArray<FName> OwnedVehicles;

	/** Oyunu kaydet (ev kapısındaki yatak / kapı etkileşiminden çağrılır). */
	UFUNCTION(BlueprintCallable, Category = "Rize") bool SaveNow();
	/** Kaydı yükle ve dünyaya uygula. Kayıt yoksa false. */
	UFUNCTION(BlueprintCallable, Category = "Rize") bool LoadAndApply();
	UFUNCTION(BlueprintPure, Category = "Rize") bool HasSave() const;

	/** Ev seçimine karşılık gelen PlayerStart etiketi. */
	static FName PlayerStartTagFor(ERizeHome H);

	static FString SlotName() { return TEXT("Rize_Kayit"); }
};
