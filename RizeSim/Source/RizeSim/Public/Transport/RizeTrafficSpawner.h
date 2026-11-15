// Bir yol üzerinde akan trafiği sürdürür: saat dilimine göre hedef araç sayısını
// tutturur, oyuncudan uzakta (görüş dışında) ekler/çıkarır.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RizeTrafficSpawner.generated.h"

class ARizeRoadPath;

USTRUCT(BlueprintType)
struct FRizeTrafficMix
{
	GENERATED_BODY()
	/** URizeSplineFollowerComponent içeren araç sınıfı (binek, kamyonet, kurye motoru…). */
	UPROPERTY(EditAnywhere, Category = "Trafik") TSubclassOf<AActor> VehicleClass;
	UPROPERTY(EditAnywhere, Category = "Trafik") float Weight = 1.f;
};

UCLASS()
class RIZESIM_API ARizeTrafficSpawner : public AActor
{
	GENERATED_BODY()

public:
	ARizeTrafficSpawner();
	virtual void BeginPlay() override;

	UPROPERTY(EditInstanceOnly, Category = "Trafik") TObjectPtr<ARizeRoadPath> Path;
	UPROPERTY(EditAnywhere, Category = "Trafik") TArray<FRizeTrafficMix> Mix;
	/** Yoğun saatte 1 km'deki araç sayısı. */
	UPROPERTY(EditAnywhere, Category = "Trafik") float PeakVehiclesPerKm = 25.f;
	/** Oyuncuya bu mesafeden yakın noktada araç belirmez/kaybolmaz (cm). */
	UPROPERTY(EditAnywhere, Category = "Trafik") float HiddenSpawnRadius = 8000.f;

private:
	void Rebalance();
	TSubclassOf<AActor> PickClass() const;
	bool IsNearPlayer(float DistanceCm) const;

	UPROPERTY() TArray<TObjectPtr<AActor>> Spawned;
	FTimerHandle Timer;
};
