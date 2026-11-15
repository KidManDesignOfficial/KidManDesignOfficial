// Oyuncunun kendi dolmuşunu sürüp hat işletmesi. Sürülebilir dolmuş aracına eklenir.
// Hattın bir durağında (15 m içinde) tamamen durunca bekleyen yolcular biner,
// ücret kasaya girer; inmek isteyenler iner. Günlük hasılat tutulur.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "RizeDolmusOperatorComponent.generated.h"

class ARizeDolmusStop;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FRizeOnOperatorStop, FText, StopName, int32, Boarded, int32, Alighted);

UCLASS(ClassGroup = (Rize), meta = (BlueprintSpawnableComponent))
class RIZESIM_API URizeDolmusOperatorComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	URizeDolmusOperatorComponent();
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hat İşletme") FName LineId;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Hat İşletme") int32 Seats = 14;
	UPROPERTY(EditAnywhere, Category = "Hat İşletme") float StopRadiusCm = 1500.f;
	/** Durunca yolcu alışverişi için bekleme (s). */
	UPROPERTY(EditAnywhere, Category = "Hat İşletme") float BoardingSeconds = 2.f;
	/** Yakıt + plaka/hat payı: sefer başına gider oranı (hasılattan). */
	UPROPERTY(EditAnywhere, Category = "Hat İşletme") float CostRatio = 0.35f;

	UPROPERTY(BlueprintReadOnly, Category = "Hat İşletme") int32 Passengers = 0;
	UPROPERTY(BlueprintReadOnly, Category = "Hat İşletme") int64 TodayRevenueKurus = 0;

	UPROPERTY(BlueprintAssignable, Category = "Hat İşletme") FRizeOnOperatorStop OnStopServed;

private:
	ARizeDolmusStop* NearbyLineStop() const;
	float StillTimer = 0.f;
	TWeakObjectPtr<ARizeDolmusStop> LastServed;
};
