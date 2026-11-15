#include "Data/RizeDataSubsystem.h"

#include "JsonObjectConverter.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "RizeSim.h"

FString URizeDataSubsystem::DataDir()
{
	return FPaths::Combine(FPaths::ProjectContentDir(), TEXT("Data"));
}

void URizeDataSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	Reload();
}

template <typename T>
bool URizeDataSubsystem::LoadArray(const FString& FileName, TMap<FName, T>& OutMap)
{
	OutMap.Reset();
	const FString Path = FPaths::Combine(DataDir(), FileName);
	FString Json;
	if (!FFileHelper::LoadFileToString(Json, *Path))
	{
		UE_LOG(LogRize, Error, TEXT("Veri dosyası okunamadı: %s"), *Path);
		return false;
	}
	TArray<T> Items;
	if (!FJsonObjectConverter::JsonArrayStringToUStruct(Json, &Items, 0, 0))
	{
		UE_LOG(LogRize, Error, TEXT("JSON ayrıştırılamadı: %s"), *Path);
		return false;
	}
	for (T& Item : Items)
	{
		if (Item.Id.IsNone())
		{
			UE_LOG(LogRize, Warning, TEXT("%s: kimliksiz kayıt atlandı"), *FileName);
			continue;
		}
		if (OutMap.Contains(Item.Id))
		{
			UE_LOG(LogRize, Warning, TEXT("%s: yinelenen kimlik %s"), *FileName, *Item.Id.ToString());
		}
		OutMap.Add(Item.Id, MoveTemp(Item));
	}
	return true;
}

void URizeDataSubsystem::Reload()
{
	LoadArray(TEXT("products.json"), Products);
	LoadArray(TEXT("shops.json"), Shops);
	LoadArray(TEXT("dolmus_lines.json"), Lines);
	LoadArray(TEXT("schedules.json"), Schedules);
	LoadArray(TEXT("vehicles.json"), Vehicles);

	Dialogue.Reset();
	FString Json;
	if (FFileHelper::LoadFileToString(Json, *FPaths::Combine(DataDir(), TEXT("dialogue.json"))))
	{
		FJsonObjectConverter::JsonArrayStringToUStruct(Json, &Dialogue, 0, 0);
	}

	// Çapraz doğrulama: dükkanlardaki ürünler tanımlı mı?
	for (const TPair<FName, FRizeShopDef>& S : Shops)
	{
		for (const FRizeShopStock& P : S.Value.Products)
		{
			if (!Products.Contains(P.ProductId))
			{
				UE_LOG(LogRize, Warning, TEXT("Dükkan %s tanımsız ürün içeriyor: %s"), *S.Key.ToString(), *P.ProductId.ToString());
			}
		}
	}

	UE_LOG(LogRize, Log, TEXT("Veri yüklendi: %d ürün, %d dükkan, %d dolmuş hattı, %d program, %d araç, %d replik"),
		Products.Num(), Shops.Num(), Lines.Num(), Schedules.Num(), Vehicles.Num(), Dialogue.Num());
}

bool URizeDataSubsystem::GetProduct(FName Id, FRizeProductDef& Out) const
{
	if (const FRizeProductDef* P = Products.Find(Id)) { Out = *P; return true; }
	return false;
}

bool URizeDataSubsystem::GetShop(FName Id, FRizeShopDef& Out) const
{
	if (const FRizeShopDef* S = Shops.Find(Id)) { Out = *S; return true; }
	return false;
}

bool URizeDataSubsystem::GetLine(FName Id, FRizeDolmusLineDef& Out) const
{
	if (const FRizeDolmusLineDef* L = Lines.Find(Id)) { Out = *L; return true; }
	return false;
}

TArray<FRizeVehicleDef> URizeDataSubsystem::GetVehiclesOfKind(FName Kind) const
{
	TArray<FRizeVehicleDef> Out;
	for (const TPair<FName, FRizeVehicleDef>& V : Vehicles)
	{
		if (Kind.IsNone() || V.Value.Kind == Kind) Out.Add(V.Value);
	}
	return Out;
}

int64 URizeDataSubsystem::PriceIn(const FRizeShopDef& Shop, FName ProductId) const
{
	for (const FRizeShopStock& S : Shop.Products)
	{
		if (S.ProductId == ProductId && S.PriceOverrideKurus > 0) return S.PriceOverrideKurus;
	}
	const FRizeProductDef* P = Products.Find(ProductId);
	return P ? P->PriceKurus : 0;
}

FString URizeDataSubsystem::PickDialogue(FName Speaker, ERizeDayPhase Phase, ERizeWeather Weather, FName Place) const
{
	TArray<const FRizeDialogueLine*> Candidates;
	float TotalWeight = 0.f;
	for (const FRizeDialogueLine& L : Dialogue)
	{
		const bool bSpeaker = L.Speaker == Speaker || L.Speaker == TEXT("herkes");
		const bool bPhase = L.Phases.Num() == 0 || L.Phases.Contains(Phase);
		const bool bWeather = L.Weathers.Num() == 0 || L.Weathers.Contains(Weather);
		const bool bPlace = L.Places.Num() == 0 || L.Places.Contains(Place);
		if (bSpeaker && bPhase && bWeather && bPlace && L.Weight > 0.f)
		{
			// Bağlama özgü replikler genel olanlara baskın gelsin
			Candidates.Add(&L);
			TotalWeight += L.Weight;
		}
	}
	if (Candidates.Num() == 0) return FString();

	float R = FMath::FRand() * TotalWeight;
	for (const FRizeDialogueLine* L : Candidates)
	{
		R -= L->Weight;
		if (R <= 0.f) return L->Text;
	}
	return Candidates.Last()->Text;
}
