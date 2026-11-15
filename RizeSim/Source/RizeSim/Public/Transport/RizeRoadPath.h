// Bir şerit / güzergah. OSM içe aktarıcısı (Tools/ue_python) yolları bu aktörün
// spline'ı olarak üretir. Yapay zeka araçları ve dolmuşlar bunun üzerinde ilerler.

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "GameFramework/Actor.h"
#include "RizeRoadPath.generated.h"

class USplineComponent;

UCLASS()
class RIZESIM_API ARizeRoadPath : public AActor
{
	GENERATED_BODY()

public:
	ARizeRoadPath();

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Yol") FName PathId;
	/** km/s cinsinden hız sınırı. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Yol") float SpeedLimitKmh = 50.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Yol") ERizeSurface Surface = ERizeSurface::Asfalt;
	/** Dolmuş hatları genelde döngüdür (son duraktan geri döner). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Yol") bool bLoop = true;

	UFUNCTION(BlueprintPure, Category = "Yol") USplineComponent* GetSpline() const { return Spline; }
	UFUNCTION(BlueprintPure, Category = "Yol") float GetLength() const;

	/** Verilen mesafede yaklaşık viraj yarıçapı (m). Düz yolda çok büyük döner. */
	float RadiusAtDistance(float DistanceCm) const;
	/** İleri bakış penceresindeki en dar viraj yarıçapı (m). */
	float MinRadiusAhead(float DistanceCm, float LookaheadCm) const;
	/** İşaretli eğim (çıkış +, iniş -). */
	float GradeAtDistance(float DistanceCm) const;
	/** Bir dünya konumunun spline üzerindeki en yakın mesafesi (cm). */
	float ProjectToDistance(const FVector& WorldLocation) const;
	/** Döngüde iki mesafe arasındaki ileri yöndeki fark (cm). */
	float ForwardGap(float From, float To) const;

	static ARizeRoadPath* FindById(const UWorld* World, FName Id);

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Yol") TObjectPtr<USplineComponent> Spline;
};
