#include "NPC/RizeLocationMarker.h"

#include "Components/BillboardComponent.h"
#include "EngineUtils.h"

ARizeLocationMarker::ARizeLocationMarker()
{
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
#if WITH_EDITORONLY_DATA
	if (UBillboardComponent* B = CreateEditorOnlyDefaultSubobject<UBillboardComponent>(TEXT("Icon")))
	{
		B->SetupAttachment(RootComponent);
	}
#endif
}

ARizeLocationMarker* ARizeLocationMarker::FindFree(UWorld* World, FName Tag, const FVector& Near, AActor* For)
{
	ARizeLocationMarker* Best = nullptr;
	double BestDist = TNumericLimits<double>::Max();
	for (TActorIterator<ARizeLocationMarker> It(World); It; ++It)
	{
		if (It->LocationTag != Tag) continue;
		if (It->Occupant.IsValid() && It->Occupant.Get() != For) continue;
		const double D = FVector::DistSquared(It->GetActorLocation(), Near);
		if (D < BestDist) { BestDist = D; Best = *It; }
	}
	return Best;
}
