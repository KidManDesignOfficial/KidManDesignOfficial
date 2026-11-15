#include "Transport/RizeTrafficSubsystem.h"

#include "Components/SplineComponent.h"
#include "Engine/World.h"
#include "GameFramework/Pawn.h"
#include "Kismet/GameplayStatics.h"
#include "Transport/RizeRoadPath.h"
#include "Transport/RizeSplineFollowerComponent.h"

const URizeSplineFollowerComponent* URizeTrafficSubsystem::FindLeader(const URizeSplineFollowerComponent* Self) const
{
	if (!Self || !Self->Path) return nullptr;
	const URizeSplineFollowerComponent* Best = nullptr;
	float BestGap = TNumericLimits<float>::Max();
	for (const TWeakObjectPtr<URizeSplineFollowerComponent>& W : Followers)
	{
		const URizeSplineFollowerComponent* O = W.Get();
		if (!O || O == Self || O->Path != Self->Path) continue;
		const float Gap = Self->Path->ForwardGap(Self->DistanceCm, O->DistanceCm);
		if (Gap > 0.f && Gap < BestGap) { BestGap = Gap; Best = O; }
	}
	return Best;
}

float URizeTrafficSubsystem::PedestrianGapAhead(const URizeSplineFollowerComponent* Self) const
{
	constexpr float Far = 1e11f;
	if (!Self || !Self->Path) return Far;
	const APawn* Player = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
	if (!Player || Player == Self->GetOwner()) return Far;

	const ARizeRoadPath* Path = Self->Path;
	const FVector P = Player->GetActorLocation();
	const float D = Path->ProjectToDistance(P);
	const FVector OnLane = Path->GetSpline()->GetLocationAtDistanceAlongSpline(D, ESplineCoordinateSpace::World)
		+ Path->GetSpline()->GetRightVectorAtDistanceAlongSpline(D, ESplineCoordinateSpace::World) * Self->LaneOffsetCm;
	if (FVector::Dist2D(OnLane, P) > 250.f || FMath::Abs(OnLane.Z - P.Z) > 300.f) return Far;

	const float Gap = Path->ForwardGap(Self->DistanceCm, D);
	if (Gap > 4000.f) return Far; // 40 m'den uzak: henüz tepki yok
	return FMath::Max(0.f, Gap - 0.5f * Self->VehicleLengthCm - 100.f);
}

float URizeTrafficSubsystem::DensityForHour(float Hour)
{
	// Rize gündelik akış: 07:30–09:00 ve 17:00–19:00 yoğun, öğle orta, gece seyrek
	struct FKey { float H; float V; };
	static const FKey Keys[] = {
		{0.f, 0.08f}, {5.f, 0.06f}, {6.5f, 0.3f}, {8.f, 1.0f}, {9.5f, 0.6f}, {12.f, 0.75f},
		{14.f, 0.6f}, {17.5f, 1.0f}, {19.f, 0.7f}, {21.f, 0.35f}, {23.f, 0.15f}, {24.f, 0.08f}};
	for (int32 i = 0; i + 1 < UE_ARRAY_COUNT(Keys); ++i)
	{
		if (Hour >= Keys[i].H && Hour <= Keys[i + 1].H)
		{
			const float A = (Hour - Keys[i].H) / FMath::Max(0.01f, Keys[i + 1].H - Keys[i].H);
			return FMath::Lerp(Keys[i].V, Keys[i + 1].V, FMath::SmoothStep(0.f, 1.f, A));
		}
	}
	return 0.1f;
}
