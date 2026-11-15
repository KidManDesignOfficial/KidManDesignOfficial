#include "Transport/RizeDolmusLineManager.h"

#include "Data/RizeDataSubsystem.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"
#include "RizeSim.h"
#include "Transport/RizeDolmus.h"
#include "Transport/RizeRoadPath.h"

ARizeDolmusLineManager::ARizeDolmusLineManager()
{
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void ARizeDolmusLineManager::BeginPlay()
{
	Super::BeginPlay();
	const URizeDataSubsystem* Data = GetGameInstance()->GetSubsystem<URizeDataSubsystem>();
	const FRizeDolmusLineDef* Line = Data ? Data->FindLine(LineId) : nullptr;
	ARizeRoadPath* Path = Line ? ARizeRoadPath::FindById(GetWorld(), Line->PathId) : nullptr;
	if (!Line || !Path || !DolmusClass)
	{
		UE_LOG(LogRize, Warning, TEXT("Dolmuş hattı kurulamadı: %s (hat/yol/sınıf eksik)"), *LineId.ToString());
		return;
	}

	// Tur süresi / sefer aralığı = gereken araç sayısı
	const float LoopSeconds = Path->GetLength() / 100.f / FMath::Max(1.f, AverageSpeedMps);
	const float Headway = FMath::Max(1.f, Line->HeadwayMinutes * Line->RushHeadwayFactor) * 60.f; // yoğun saate göre boyutla
	const int32 Count = FMath::Clamp(FMath::CeilToInt(LoopSeconds / Headway), 1, MaxVehicles);

	for (int32 i = 0; i < Count; ++i)
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		ARizeDolmus* D = GetWorld()->SpawnActor<ARizeDolmus>(DolmusClass, FTransform::Identity, P);
		if (!D) continue;
		D->InitOnLine(LineId, Path->GetLength() * (float)i / (float)Count);
		Fleet.Add(D);
	}
	UE_LOG(LogRize, Log, TEXT("Hat %s: %d dolmuş (tur %.0f dk)"), *LineId.ToString(), Count, LoopSeconds / 60.f);
}
