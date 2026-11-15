// Gece yanan her şey: sokak lambaları, yamaçtaki ev pencereleri, dükkan tabelaları.
// Sahibindeki tüm ışık bileşenlerini ve "Emissive" malzeme parametresini sürer.
// Lambalar aynı anda değil, birkaç saniyelik rastgele gecikmelerle yanar;
// evlerin bir kısmı gece yarısından sonra ışığını söndürür.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "RizeNightLightComponent.generated.h"

class UMaterialInstanceDynamic;

UENUM(BlueprintType)
enum class ERizeLightKind : uint8
{
	SokakLambasi UMETA(DisplayName = "Sokak Lambası"),
	EvPenceresi  UMETA(DisplayName = "Ev Penceresi"),
	DukkanTabela UMETA(DisplayName = "Dükkan Tabelası")
};

UCLASS(ClassGroup = (Rize), meta = (BlueprintSpawnableComponent))
class RIZESIM_API URizeNightLightComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	URizeNightLightComponent();
	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, Category = "Işık") ERizeLightKind Kind = ERizeLightKind::SokakLambasi;
	/** Ev pencereleri: bu saatten sonra söner (rastgele ±1 saat). */
	UPROPERTY(EditAnywhere, Category = "Işık") float HouseLightsOffHour = 0.5f;
	/** Ev pencereleri: sabah bu saatte bir an yanar (sabah namazı, kahvaltı). */
	UPROPERTY(EditAnywhere, Category = "Işık") float HouseMorningOnHour = 5.5f;
	UPROPERTY(EditAnywhere, Category = "Işık") float EmissiveOn = 20.f;
	UPROPERTY(EditAnywhere, Category = "Işık") FName EmissiveParameter = TEXT("Emissive");

	UFUNCTION(BlueprintCallable, Category = "Işık") void SetLit(bool bLit);

private:
	UFUNCTION() void OnStreetLightsChanged(bool bOn);
	UFUNCTION() void OnHourChanged(int32 Hour);
	void Evaluate();

	UPROPERTY() TArray<TObjectPtr<UMaterialInstanceDynamic>> Mids;
	float PersonalOffset = 0.f;
	bool bLit = false;
	FTimerHandle DelayTimer;
};
