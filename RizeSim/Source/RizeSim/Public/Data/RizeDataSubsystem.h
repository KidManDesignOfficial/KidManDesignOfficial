// Oyun açılışında Content/Data/*.json dosyalarını yükler ve sorgulanabilir kılar.
// Paketli oyunda da çalışır (DefaultGame.ini → DirectoriesToAlwaysStageAsNonUFS=Data).

#pragma once

#include "CoreMinimal.h"
#include "Data/RizeDataTypes.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "RizeDataSubsystem.generated.h"

UCLASS()
class RIZESIM_API URizeDataSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	/** Tüm JSON dosyalarını yeniden okur (editörde veri düzenlerken). */
	UFUNCTION(BlueprintCallable, Category = "Rize|Veri") void Reload();

	const FRizeProductDef* FindProduct(FName Id) const { return Products.Find(Id); }
	const FRizeShopDef* FindShop(FName Id) const { return Shops.Find(Id); }
	const FRizeDolmusLineDef* FindLine(FName Id) const { return Lines.Find(Id); }
	const FRizeScheduleDef* FindSchedule(FName Id) const { return Schedules.Find(Id); }
	const FRizeVehicleDef* FindVehicle(FName Id) const { return Vehicles.Find(Id); }

	UFUNCTION(BlueprintCallable, Category = "Rize|Veri") bool GetProduct(FName Id, FRizeProductDef& Out) const;
	UFUNCTION(BlueprintCallable, Category = "Rize|Veri") bool GetShop(FName Id, FRizeShopDef& Out) const;
	UFUNCTION(BlueprintCallable, Category = "Rize|Veri") bool GetLine(FName Id, FRizeDolmusLineDef& Out) const;
	UFUNCTION(BlueprintCallable, Category = "Rize|Veri") TArray<FRizeVehicleDef> GetVehiclesOfKind(FName Kind) const;

	/** Bağlama uyan replikleri ağırlıklı rastgele seçer. Uyan yoksa boş metin. */
	UFUNCTION(BlueprintCallable, Category = "Rize|Veri")
	FString PickDialogue(FName Speaker, ERizeDayPhase Phase, ERizeWeather Weather, FName Place) const;

	/** Bir dükkanda ürünün geçerli fiyatı (dükkana özel fiyat öncelikli). */
	int64 PriceIn(const FRizeShopDef& Shop, FName ProductId) const;

	static FString DataDir();

private:
	template <typename T>
	bool LoadArray(const FString& FileName, TMap<FName, T>& OutMap);

	TMap<FName, FRizeProductDef> Products;
	TMap<FName, FRizeShopDef> Shops;
	TMap<FName, FRizeDolmusLineDef> Lines;
	TMap<FName, FRizeScheduleDef> Schedules;
	TMap<FName, FRizeVehicleDef> Vehicles;
	TArray<FRizeDialogueLine> Dialogue;
};
