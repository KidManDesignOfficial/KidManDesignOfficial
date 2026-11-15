#include "Transport/RizeTrafficSpawner.h"

#include "Components/SplineComponent.h"
#include "Engine/World.h"
#include "GameFramework/Pawn.h"
#include "Kismet/GameplayStatics.h"
#include "Time/RizeTimeSubsystem.h"
#include "TimerManager.h"
#include "Transport/RizeRoadPath.h"
#include "Transport/RizeSplineFollowerComponent.h"
#include "Transport/RizeTrafficSubsystem.h"

ARizeTrafficSpawner::ARizeTrafficSpawner()
{
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void ARizeTrafficSpawner::BeginPlay()
{
	Super::BeginPlay();
	GetWorldTimerManager().SetTimer(Timer, this, &ARizeTrafficSpawner::Rebalance, 2.f, true, 0.1f);
}

TSubclassOf<AActor> ARizeTrafficSpawner::PickClass() const
{
	float Total = 0.f;
	for (const FRizeTrafficMix& M : Mix) Total += M.VehicleClass ? M.Weight : 0.f;
	float R = FMath::FRand() * Total;
	for (const FRizeTrafficMix& M : Mix)
	{
		if (!M.VehicleClass) continue;
		R -= M.Weight;
		if (R <= 0.f) return M.VehicleClass;
	}
	return nullptr;
}

bool ARizeTrafficSpawner::IsNearPlayer(float DistanceCm) const
{
	const APawn* P = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!P || !Path) return false;
	const FVector L = Path->GetSpline()->GetLocationAtDistanceAlongSpline(DistanceCm, ESplineCoordinateSpace::World);
	return FVector::Dist(L, P->GetActorLocation()) < HiddenSpawnRadius;
}

void ARizeTrafficSpawner::Rebalance()
{
	if (!Path || Mix.Num() == 0) return;
	Spawned.RemoveAll([](const TObjectPtr<AActor>& A) { return !IsValid(A); });

	const URizeTimeSubsystem* Time = GetWorld()->GetSubsystem<URizeTimeSubsystem>();
	const float Density = URizeTrafficSubsystem::DensityForHour(Time ? (float)Time->GetHour() : 12.f);
	const int32 Target = FMath::RoundToInt(Path->GetLength() / 100000.f * PeakVehiclesPerKm * Density);

	// Eksikse görüş dışında, araç aralarına ekle (her turda en fazla 2: ani doluluk olmasın)
	for (int32 Added = 0; Spawned.Num() < Target && Added < 2; ++Added)
	{
		const float D = FMath::FRandRange(0.f, Path->GetLength());
		if (IsNearPlayer(D)) continue;
		// Başka aracın üstüne doğmasın: aynı yolda 15 m içinde araç varsa atla
		const bool bCrowded = Spawned.ContainsByPredicate([&](const TObjectPtr<AActor>& Other)
		{
			const URizeSplineFollowerComponent* OF = Other ? Other->FindComponentByClass<URizeSplineFollowerComponent>() : nullptr;
			return OF && FMath::Min(Path->ForwardGap(D, OF->DistanceCm), Path->ForwardGap(OF->DistanceCm, D)) < 1500.f;
		});
		if (bCrowded) continue;
		TSubclassOf<AActor> Cls = PickClass();
		if (!Cls) break;
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		AActor* A = GetWorld()->SpawnActor<AActor>(Cls, FTransform::Identity, P);
		if (!A) break;
		if (URizeSplineFollowerComponent* F = A->FindComponentByClass<URizeSplineFollowerComponent>())
		{
			F->SetPath(Path, D);
			F->DriverTemper = FMath::FRandRange(0.85f, 1.08f);
		}
		Spawned.Add(A);
	}

	// Fazlaysa oyuncudan uzaktaki birini kaldır
	if (Spawned.Num() > Target)
	{
		for (int32 i = Spawned.Num() - 1; i >= 0; --i)
		{
			const URizeSplineFollowerComponent* F = Spawned[i]->FindComponentByClass<URizeSplineFollowerComponent>();
			if (F && !IsNearPlayer(F->DistanceCm))
			{
				Spawned[i]->Destroy();
				Spawned.RemoveAt(i);
				break;
			}
		}
	}
}
