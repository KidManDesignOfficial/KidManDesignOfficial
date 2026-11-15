// Bir aktörü yol spline'ı üzerinde gerçekçi hızla yürütür: viraj, eğim,
// ıslak zemin, öndeki araç ve duraklar hesaba katılır (Sim/RizeDriving.h).
// Akan trafikteki araçlar ve yapay zeka dolmuşları bunu kullanır. Fizik değil,
// kinematik hareket: yüzlerce araç için ucuz ve kararlıdır.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "RizeSplineFollowerComponent.generated.h"

class ARizeRoadPath;

UCLASS(ClassGroup = (Rize), meta = (BlueprintSpawnableComponent))
class RIZESIM_API URizeSplineFollowerComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	URizeSplineFollowerComponent();
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type Reason) override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Rize|Takip") void SetPath(ARizeRoadPath* NewPath, float StartDistanceCm);

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Takip") TObjectPtr<ARizeRoadPath> Path;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Takip") float DistanceCm = 0.f;
	/** Sürücü karakteri: 1 = hız sınırına uyar, 0.85 = temkinli, 1.1 = aceleci. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Takip") float DriverTemper = 1.f;
	/** Araç boyu (cm) — takip mesafesi hesabında. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Takip") float VehicleLengthCm = 450.f;
	/** Şerit ofseti (cm, sağa +): spline yol ekseniyse sağ şeride kaydırır. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rize|Takip") float LaneOffsetCm = 175.f;

	/** Bir sonraki zorunlu duruş noktası (durak, ışık); yoksa < 0. Sahibi ayarlar. */
	UPROPERTY(BlueprintReadWrite, Category = "Rize|Takip") float StopAtDistanceCm = -1.f;

	UFUNCTION(BlueprintPure, Category = "Rize|Takip") float GetSpeedMps() const { return SpeedMps; }
	UFUNCTION(BlueprintPure, Category = "Rize|Takip") bool IsStopped() const { return SpeedMps < 0.05f; }

private:
	float ComputeTargetSpeed(float& OutLeaderGapM) const;
	void PlaceOwner();

	float SpeedMps = 0.f;
};
