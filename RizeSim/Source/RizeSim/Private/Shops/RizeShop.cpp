#include "Shops/RizeShop.h"

#include "Components/BoxComponent.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "RizeSim.h"
#include "Sim/RizeClock.h"
#include "Time/RizeTimeSubsystem.h"

#define LOCTEXT_NAMESPACE "RizeShop"

ARizeShop::ARizeShop()
{
	Interior = CreateDefaultSubobject<UBoxComponent>(TEXT("Interior"));
	Interior->SetBoxExtent(FVector(500, 400, 200));
	Interior->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	RootComponent = Interior;
}

void ARizeShop::BeginPlay()
{
	Super::BeginPlay();

	if (const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>())
	{
		if (const FRizeShopDef* D = Data->FindShop(ShopId))
		{
			Def = *D;
		}
		else
		{
			UE_LOG(LogRize, Warning, TEXT("%s: shops.json içinde '%s' yok"), *GetName(), *ShopId.ToString());
		}
	}
	for (const FRizeShopStock& S : Def.Products) Stock.Add(S.ProductId, S.Stock);

	if (URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>())
	{
		Time->OnHourChanged.AddDynamic(this, &ARizeShop::OnHourChanged);
		LastRestockDay = Time->GetDay();
	}
	bWasOpen = IsOpenNow();
	Interior->OnComponentEndOverlap.AddDynamic(this, &ARizeShop::OnInteriorEndOverlap);
}

bool ARizeShop::IsOpenNow() const
{
	const URizeTimeSubsystem* Time = GetWorld() ? GetWorld()->GetSubsystem<URizeTimeSubsystem>() : nullptr;
	if (!Time) return true;
	if (Def.ClosedWeekdays.Contains(Time->GetWeekday())) return false;
	const RizeSim::FHourRange Hours{Def.OpenHour, Def.CloseHour};
	return Hours.Contains(Time->GetHour());
}

FText ARizeShop::GetDisplayName() const
{
	return Def.Name.IsEmpty() ? FText::FromName(ShopId) : FText::FromString(Def.Name);
}

FText ARizeShop::GetOpeningHint() const
{
	const URizeTimeSubsystem* Time = GetWorld() ? GetWorld()->GetSubsystem<URizeTimeSubsystem>() : nullptr;
	if (Time && Def.ClosedWeekdays.Contains(Time->GetWeekday()))
	{
		return LOCTEXT("ClosedToday", "Bugün kapalı");
	}
	const int32 H = FMath::FloorToInt(Def.OpenHour);
	const int32 M = FMath::RoundToInt((Def.OpenHour - H) * 60.f);
	return FText::Format(LOCTEXT("OpensAt", "{0}'de açılır"), FText::FromString(FString::Printf(TEXT("%02d:%02d"), H, M)));
}

int32 ARizeShop::GetStock(FName ProductId) const
{
	const int32* S = Stock.Find(ProductId);
	return S ? *S : 0;
}

int64 ARizeShop::GetPrice(FName ProductId) const
{
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	return Data ? Data->PriceIn(Def, ProductId) : 0;
}

bool ARizeShop::TakeOne(FName ProductId)
{
	int32* S = Stock.Find(ProductId);
	if (!S || *S <= 0) return false;
	--(*S);
	return true;
}

void ARizeShop::ReturnStock(FName ProductId, int32 Quantity)
{
	if (Quantity > 0) Stock.FindOrAdd(ProductId) += Quantity;
}

void ARizeShop::OnHourChanged(int32 Hour)
{
	const bool bOpen = IsOpenNow();
	if (bOpen != bWasOpen)
	{
		bWasOpen = bOpen;
		OnOpenChanged.Broadcast(bOpen); // kepenk animasyonu, ışıklar, esnaf NPC'si
	}

	// Her sabah açılışta stok yenilenir (toptancı uğradı)
	const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	if (Time && bOpen && Time->GetDay() != LastRestockDay)
	{
		LastRestockDay = Time->GetDay();
		for (const FRizeShopStock& S : Def.Products) Stock.Add(S.ProductId, FMath::Max(Stock.FindRef(S.ProductId), S.Stock));
	}
}

void ARizeShop::OnInteriorEndOverlap(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex)
{
	ARizePlayerCharacter* Player = Cast<ARizePlayerCharacter>(Other);
	if (!Player || !Player->GetWallet()) return;
	URizeWalletComponent* W = Player->GetWallet();
	if (W->CartShopId != ShopId || W->IsCartEmpty()) return;

	// Ödenmemiş ürünler rafa geri konur
	for (const RizeSim::FCartLine& L : W->GetCart().GetLines())
	{
		ReturnStock(FName(UTF8_TO_TCHAR(L.ProductId.c_str())), L.Quantity);
	}
	W->ClearCart();
	Player->ShowSubtitle(GetDisplayName(), LOCTEXT("CartReturned", "Sepetteki ürünler rafa geri kondu."));
}

#undef LOCTEXT_NAMESPACE
