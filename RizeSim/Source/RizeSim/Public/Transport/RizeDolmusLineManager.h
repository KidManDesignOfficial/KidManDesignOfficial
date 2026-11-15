// Bir dolmuş hattını işletir: sefer aralığına (headway) göre kaç araç gerektiğini
// hesaplar ve hatta eşit aralıklarla yerleştirir.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RizeDolmusLineManager.generated.h"

class ARizeDolmus;

UCLASS()
class RIZESIM_API ARizeDolmusLineManager : public AActor
{
	GENERATED_BODY()

public:
	ARizeDolmusLineManager();
	virtual void BeginPlay() override;

	UPROPERTY(EditInstanceOnly, Category = "Hat") FName LineId;
	UPROPERTY(EditAnywhere, Category = "Hat") TSubclassOf<ARizeDolmus> DolmusClass;
	/** Ortalama işletme hızı (m/s), durak beklemeleri dahil. */
	UPROPERTY(EditAnywhere, Category = "Hat") float AverageSpeedMps = 6.f;
	UPROPERTY(EditAnywhere, Category = "Hat", meta = (ClampMin = 1)) int32 MaxVehicles = 8;

private:
	UPROPERTY() TArray<TObjectPtr<ARizeDolmus>> Fleet;
};
