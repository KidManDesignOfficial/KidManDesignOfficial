#include "Shops/RizeServiceCounter.h"

#include "Components/StaticMeshComponent.h"
#include "Core/RizeTypes.h"
#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Player/RizePlayerCharacter.h"
#include "Player/RizeWalletComponent.h"
#include "Shops/RizeShop.h"
#include "Time/RizeTimeSubsystem.h"
#include "TimerManager.h"
#include "Weather/RizeWeatherSubsystem.h"

#define LOCTEXT_NAMESPACE "RizeService"

ARizeServiceCounter::ARizeServiceCounter()
{
	Counter = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Counter"));
	Counter->SetCollisionProfileName(TEXT("BlockAllDynamic"));
	RootComponent = Counter;
	ServePoint = CreateDefaultSubobject<USceneComponent>(TEXT("ServePoint"));
	ServePoint->SetupAttachment(Counter);
	ServePoint->SetRelativeLocation(FVector(80, 0, 75));
}

FText ARizeServiceCounter::NameOf(FName ProductId) const
{
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeProductDef* P = Data ? Data->FindProduct(ProductId) : nullptr;
	return P ? FText::FromString(P->Name) : FText::FromName(ProductId);
}

bool ARizeServiceCounter::CanInteract_Implementation(AActor* Interactor) const
{
	return Shop && Shop->IsOpenNow();
}

FText ARizeServiceCounter::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	if (!Shop || DefaultProduct.IsNone()) return LOCTEXT("Menu", "Menüye bak");
	const FString Price = RizeConv::FromStd(RizeSim::FormatTL(Shop->GetPrice(DefaultProduct)));
	return FText::Format(LOCTEXT("OrderDefault", "Söyle: {0} — {1}"), NameOf(DefaultProduct), FText::FromString(Price));
}

FText ARizeServiceCounter::GetSecondaryPrompt_Implementation(AActor* Interactor) const
{
	return LOCTEXT("OpenMenu", "Menü");
}

void ARizeServiceCounter::Interact_Implementation(AActor* Interactor)
{
	if (DefaultProduct.IsNone()) { InteractSecondary_Implementation(Interactor); return; }
	Order(Cast<ARizePlayerCharacter>(Interactor), DefaultProduct);
}

void ARizeServiceCounter::InteractSecondary_Implementation(AActor* Interactor)
{
	OnMenuRequested.Broadcast(this, GetMenu());
}

TArray<FRizeProductDef> ARizeServiceCounter::GetMenu() const
{
	TArray<FRizeProductDef> Menu;
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	if (!Shop || !Data) return Menu;
	for (const FRizeShopStock& S : Shop->GetDef().Products)
	{
		if (const FRizeProductDef* P = Data->FindProduct(S.ProductId))
		{
			FRizeProductDef Item = *P;
			Item.PriceKurus = Data->PriceIn(Shop->GetDef(), S.ProductId);
			Menu.Add(Item);
		}
	}
	return Menu;
}

bool ARizeServiceCounter::Order(ARizePlayerCharacter* Player, FName ProductId)
{
	if (!Player || !Shop || !Player->GetWallet()) return false;
	if (!Shop->IsOpenNow())
	{
		Player->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("Closed", "Ocak söndü, kapattık."));
		return false;
	}
	if (!Shop->TakeOne(ProductId))
	{
		Player->ShowSubtitle(Shop->GetDisplayName(), FText::Format(LOCTEXT("SoldOut", "{0} bitti, kusura bakma."), NameOf(ProductId)));
		return false;
	}
	if (!Player->GetWallet()->Pay(Shop->GetPrice(ProductId)))
	{
		Shop->ReturnStock(ProductId, 1);
		Player->ShowSubtitle(Shop->GetDisplayName(), LOCTEXT("NoMoney", "Sonra verirsin… ama şimdilik olmaz."));
		return false;
	}

	if (OrderSound) UGameplayStatics::PlaySoundAtLocation(this, OrderSound, GetActorLocation());

	// Bağlama uygun karşılık (yağmurlu sabah, kalabalık öğle…)
	FString Line;
	if (const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>())
	{
		const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
		const URizeWeatherSubsystem* Weather = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
		Line = Data->PickDialogue(StaffSpeaker,
			Time ? Time->GetPhase() : ERizeDayPhase::Sabah,
			Weather ? Weather->GetWeather() : ERizeWeather::Acik,
			Shop->GetDef().Type);
	}
	Player->ShowSubtitle(Shop->GetDisplayName(), Line.IsEmpty() ? LOCTEXT("Coming", "Hemen geliyor!") : FText::FromString(Line));

	FTimerHandle Handle;
	FTimerDelegate D = FTimerDelegate::CreateUObject(this, &ARizeServiceCounter::Serve, ProductId, TWeakObjectPtr<ARizePlayerCharacter>(Player));
	GetWorldTimerManager().SetTimer(Handle, D, ServeDelaySeconds, false);
	return true;
}

void ARizeServiceCounter::Serve(FName ProductId, TWeakObjectPtr<ARizePlayerCharacter> Player)
{
	if (const TSubclassOf<AActor>* Visual = ServedVisuals.Find(ProductId))
	{
		if (*Visual)
		{
			GetWorld()->SpawnActor<AActor>(*Visual, ServePoint->GetComponentTransform());
		}
	}
	if (Player.IsValid() && Shop)
	{
		Player->ShowSubtitle(Shop->GetDisplayName(), FText::Format(LOCTEXT("Served", "{0} geldi, afiyet olsun."), NameOf(ProductId)));
	}
}

#undef LOCTEXT_NAMESPACE
