#include "Transport/RizeRoadPath.h"

#include "Components/SplineComponent.h"
#include "EngineUtils.h"

ARizeRoadPath::ARizeRoadPath()
{
	Spline = CreateDefaultSubobject<USplineComponent>(TEXT("Spline"));
	RootComponent = Spline;
	Spline->SetClosedLoop(false);
}

float ARizeRoadPath::GetLength() const
{
	return Spline->GetSplineLength();
}

float ARizeRoadPath::RadiusAtDistance(float DistanceCm) const
{
	// Üç nokta çemberi: d-Δ, d, d+Δ
	const float Delta = 300.f;
	const float L = GetLength();
	auto At = [&](float D)
	{
		D = bLoop ? FMath::Fmod(D + L, L) : FMath::Clamp(D, 0.f, L);
		return Spline->GetLocationAtDistanceAlongSpline(D, ESplineCoordinateSpace::World);
	};
	const FVector A = At(DistanceCm - Delta), B = At(DistanceCm), C = At(DistanceCm + Delta);
	const FVector2D a(A), b(B), c(C);
	const double ab = FVector2D::Distance(a, b), bc = FVector2D::Distance(b, c), ca = FVector2D::Distance(c, a);
	const double Area2 = FMath::Abs((b.X - a.X) * (c.Y - a.Y) - (b.Y - a.Y) * (c.X - a.X));
	if (Area2 < 1.0) return 1e6f;
	return (float)((ab * bc * ca) / (2.0 * Area2) / 100.0); // cm → m
}

float ARizeRoadPath::MinRadiusAhead(float DistanceCm, float LookaheadCm) const
{
	float MinR = 1e6f;
	for (float D = 0.f; D <= LookaheadCm; D += 500.f)
	{
		MinR = FMath::Min(MinR, RadiusAtDistance(DistanceCm + D));
	}
	return MinR;
}

float ARizeRoadPath::GradeAtDistance(float DistanceCm) const
{
	const FVector Dir = Spline->GetDirectionAtDistanceAlongSpline(DistanceCm, ESplineCoordinateSpace::World);
	const double Horizontal = FMath::Max(FVector2D(Dir).Size(), 0.05);
	return (float)(Dir.Z / Horizontal);
}

float ARizeRoadPath::ProjectToDistance(const FVector& WorldLocation) const
{
	const float Key = Spline->FindInputKeyClosestToWorldLocation(WorldLocation);
	return Spline->GetDistanceAlongSplineAtSplineInputKey(Key);
}

float ARizeRoadPath::ForwardGap(float From, float To) const
{
	const float Gap = To - From;
	if (Gap >= 0.f) return Gap;
	return bLoop ? Gap + GetLength() : TNumericLimits<float>::Max();
}

ARizeRoadPath* ARizeRoadPath::FindById(const UWorld* World, FName Id)
{
	if (!World) return nullptr;
	for (TActorIterator<ARizeRoadPath> It(const_cast<UWorld*>(World)); It; ++It)
	{
		if (It->PathId == Id) return *It;
	}
	return nullptr;
}
