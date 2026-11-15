// JSON veri dosyalarının (Content/Data/*.json) C++ karşılıkları.
// Alan adları JSON anahtarlarıyla eşleşir (büyük/küçük harf duyarsız).
// Tasarımcı yeni ürün, dükkan, hat veya diyalog eklemek için kod değil JSON düzenler.

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "RizeDataTypes.generated.h"

USTRUCT(BlueprintType)
struct FRizeProductDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Name;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Category;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int64 PriceKurus = 0;
	/** true: masaya servis edilir (çay, yemek) — rafta durmaz, sipariş verilir. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") bool bServed = false;
	/** Dünyadaki görsel temsil (yumuşak referans; boşsa yer tutucu kutu). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Mesh;
};

USTRUCT(BlueprintType)
struct FRizeShopStock
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName ProductId;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int32 Stock = 10;
	/** 0 değilse ürünün dükkana özel fiyatı. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int64 PriceOverrideKurus = 0;
};

USTRUCT(BlueprintType)
struct FRizeShopDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Name;
	/** bakkal | market | kiraathane | cay_ocagi | lokanta | firin | galeri | tamirci */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Type;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float OpenHour = 8.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float CloseHour = 20.f;
	/** Kapalı günler: 0 = Pazartesi … 6 = Pazar. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<int32> ClosedWeekdays;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<FRizeShopStock> Products;
	/** Ortam sesi kümesi, örn. "kiraathane_okey", "lokanta_mutfak". */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Ambience;
};

USTRUCT(BlueprintType)
struct FRizeDolmusStopDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Name;
};

USTRUCT(BlueprintType)
struct FRizeDolmusLineDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Name;
	/** Dünyadaki ARizeRoadPath kimliği (hat güzergahı). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName PathId;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int64 FareKurus = 0;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float FirstDepartureHour = 6.5f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float LastDepartureHour = 22.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float HeadwayMinutes = 15.f;
	/** Sabah/akşam yoğun saatlerde sefer sıklığı çarpanı (0.5 = iki kat sık). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float RushHeadwayFactor = 0.5f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<FRizeDolmusStopDef> Stops;
};

/** Bağlama duyarlı NPC repliği: saat dilimi, hava ve mekana göre seçilir. */
USTRUCT(BlueprintType)
struct FRizeDialogueLine
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	/** esnaf | cayci | dolmusci | yasli | genc | herkes */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Speaker;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Text;
	/** Boşsa her zaman geçerli. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<ERizeDayPhase> Phases;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<ERizeWeather> Weathers;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<FName> Places;
	/** Seçim ağırlığı (özel replikler için yükseltilir). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float Weight = 1.f;
};

USTRUCT(BlueprintType)
struct FRizeScheduleEntryDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float From = 0.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") float To = 0.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Activity;
	/** Dünyadaki ARizeLocationMarker etiketi. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Location;
	/** Bit maskesi: 1=Pzt, 2=Sal, 4=Çar, 8=Per, 16=Cum, 32=Cmt, 64=Paz. 127 = her gün. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int32 Weekdays = 127;
};

USTRUCT(BlueprintType)
struct FRizeScheduleDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") TArray<FRizeScheduleEntryDef> Entries;
};

USTRUCT(BlueprintType)
struct FRizeVehicleDef
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Id;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString Name;
	/** binek | hafif_ticari | motor | dolmus */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FName Kind;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int64 PriceKurus = 0;
	/** Blueprint sınıf yolu, örn. "/Game/Vehicles/BP_Binek_Sedan.BP_Binek_Sedan_C". */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") FString VehicleClass;
	/** Tamircide tam bakım ücreti. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize") int64 ServiceKurus = 0;
};
