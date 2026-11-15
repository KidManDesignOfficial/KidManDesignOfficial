// Mekan ses atmosferi: çay ocağında bardak-kaşık şıngırtısı, kıraathanede okey
// taşları, lokantada mutfak, sahilde dalga, çarşıda kalabalık uğultusu.
// Ses düzeyi saat dilimine (kalabalık) ve havaya (yağmur sesi bastırır) göre ayarlanır.
// "Koku" hissi görsel/işitsel ipuçlarıyla verilir: buhar partikülleri, semaver fokurtusu.

#pragma once

#include "CoreMinimal.h"
#include "Core/RizeTypes.h"
#include "GameFramework/Actor.h"
#include "RizeAmbientZone.generated.h"

class ARizeShop;
class UAudioComponent;
class UBoxComponent;
class USoundBase;

UCLASS()
class RIZESIM_API ARizeAmbientZone : public AActor
{
	GENERATED_BODY()

public:
	ARizeAmbientZone();
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditAnywhere, Category = "Ses") TObjectPtr<USoundBase> Ambience;
	/** Saat dilimine göre yoğunluk (0..1). Boşsa her zaman 1. */
	UPROPERTY(EditAnywhere, Category = "Ses") TMap<ERizeDayPhase, float> PhaseVolume;
	/** İç mekansa yağmur sesi boğuk duyulur, mekan sesi bastırılmaz. */
	UPROPERTY(EditAnywhere, Category = "Ses") bool bIndoor = true;
	/** Bağlı dükkan kapalıyken sessiz (kepenk inik). */
	UPROPERTY(EditInstanceOnly, Category = "Ses") TObjectPtr<ARizeShop> Shop;
	UPROPERTY(EditAnywhere, Category = "Ses") float FadeSpeed = 0.5f;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Ses") TObjectPtr<UBoxComponent> Volume;
	UPROPERTY(VisibleAnywhere, Category = "Ses") TObjectPtr<UAudioComponent> Audio;

private:
	float Current = 0.f;
};
