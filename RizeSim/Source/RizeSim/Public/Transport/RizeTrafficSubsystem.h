// Trafiğin kayıt defteri: hangi araç hangi yolda, kimin arkasında.
// Yoğunluk saat dilimine göre ayarlanır (sabah işe gidiş, akşam dönüş).

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "RizeTrafficSubsystem.generated.h"

class URizeSplineFollowerComponent;

UCLASS()
class RIZESIM_API URizeTrafficSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	void Register(URizeSplineFollowerComponent* F) { Followers.AddUnique(F); }
	void Unregister(URizeSplineFollowerComponent* F) { Followers.Remove(F); }

	/** Aynı yolda hemen öndeki araç. */
	const URizeSplineFollowerComponent* FindLeader(const URizeSplineFollowerComponent* Self) const;

	/** Şeritte öndeki oyuncuya (yaya ya da kendi aracıyla) kalan mesafe (cm); yoksa çok büyük. */
	float PedestrianGapAhead(const URizeSplineFollowerComponent* Self) const;

	/** Saat dilimine göre trafik yoğunluğu çarpanı (0..1). Yayımlayıcılar kullanır. */
	UFUNCTION(BlueprintPure, Category = "Rize|Trafik") static float DensityForHour(float Hour);

	int32 Num() const { return Followers.Num(); }

private:
	TArray<TWeakObjectPtr<URizeSplineFollowerComponent>> Followers;
};
