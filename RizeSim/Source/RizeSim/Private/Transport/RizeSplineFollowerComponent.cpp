#include "Transport/RizeSplineFollowerComponent.h"

#include "Components/SplineComponent.h"
#include "Core/RizeTypes.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "Sim/RizeDriving.h"
#include "Transport/RizeRoadPath.h"
#include "Transport/RizeTrafficSubsystem.h"
#include "Weather/RizeWeatherSubsystem.h"

URizeSplineFollowerComponent::URizeSplineFollowerComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	PrimaryComponentTick.TickGroup = TG_PrePhysics;
}

void URizeSplineFollowerComponent::BeginPlay()
{
	Super::BeginPlay();
	if (URizeTrafficSubsystem* T = GetWorld()->GetSubsystem<URizeTrafficSubsystem>()) T->Register(this);
	PlaceOwner();
}

void URizeSplineFollowerComponent::EndPlay(const EEndPlayReason::Type Reason)
{
	if (URizeTrafficSubsystem* T = GetWorld()->GetSubsystem<URizeTrafficSubsystem>()) T->Unregister(this);
	Super::EndPlay(Reason);
}

void URizeSplineFollowerComponent::SetPath(ARizeRoadPath* NewPath, float StartDistanceCm)
{
	Path = NewPath;
	DistanceCm = StartDistanceCm;
	SpeedMps = 0.f;
	PlaceOwner();
}

float URizeSplineFollowerComponent::ComputeTargetSpeed(float& OutLeaderGapM) const
{
	using namespace RizeSim::Driving;
	const URizeWeatherSubsystem* Weather = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	const float Grip = Weather ? Weather->GetSurfaceGrip(Path->Surface) : 1.f;

	FSpeedPlanInput In;
	In.SpeedLimit = Path->SpeedLimitKmh / 3.6 * DriverTemper;
	In.Grip = Grip;
	// İleri bakış: mevcut hızda ~4 saniyelik yol, en az 30 m
	const float LookCm = FMath::Max(3000.f, SpeedMps * 400.f);
	In.LookaheadRadius = Path->MinRadiusAhead(DistanceCm, LookCm);
	In.Grade = Path->GradeAtDistance(DistanceCm);

	if (StopAtDistanceCm >= 0.f)
	{
		In.DistanceToStop = Path->ForwardGap(DistanceCm, StopAtDistanceCm) / 100.0;
	}

	OutLeaderGapM = 1e9f;
	float LeaderSpeed = 0.f;
	if (const URizeTrafficSubsystem* T = GetWorld()->GetSubsystem<URizeTrafficSubsystem>())
	{
		if (const URizeSplineFollowerComponent* Leader = T->FindLeader(this))
		{
			const float GapCm = Path->ForwardGap(DistanceCm, Leader->DistanceCm) - 0.5f * (VehicleLengthCm + Leader->VehicleLengthCm);
			OutLeaderGapM = GapCm / 100.f;
			LeaderSpeed = Leader->SpeedMps;
		}
	}
	// Oyuncu yolun ortasında yürüyorsa da dur: yaya önceliği
	if (const URizeTrafficSubsystem* T = GetWorld()->GetSubsystem<URizeTrafficSubsystem>())
	{
		const float PedGapM = T->PedestrianGapAhead(this) / 100.f;
		if (PedGapM < OutLeaderGapM) { OutLeaderGapM = PedGapM; LeaderSpeed = 0.f; }
	}
	In.DistanceToLeader = OutLeaderGapM;
	In.LeaderSpeed = LeaderSpeed;

	return (float)PlanTargetSpeed(In);
}

void URizeSplineFollowerComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	if (!Path || Path->GetLength() <= 1.f) return;

	float LeaderGap = 0.f;
	const float Target = ComputeTargetSpeed(LeaderGap);
	SpeedMps = (float)RizeSim::Driving::StepSpeed(SpeedMps, Target, DeltaTime);

	const float L = Path->GetLength();
	DistanceCm += SpeedMps * 100.f * DeltaTime;
	if (Path->bLoop) DistanceCm = FMath::Fmod(DistanceCm, L);
	else if (DistanceCm >= L) { DistanceCm = L; SpeedMps = 0.f; }

	PlaceOwner();
}

void URizeSplineFollowerComponent::PlaceOwner()
{
	AActor* Owner = GetOwner();
	if (!Owner || !Path) return;
	USplineComponent* S = Path->GetSpline();
	const FVector Loc = S->GetLocationAtDistanceAlongSpline(DistanceCm, ESplineCoordinateSpace::World);
	const FRotator Rot = S->GetRotationAtDistanceAlongSpline(DistanceCm, ESplineCoordinateSpace::World);
	const FVector Right = S->GetRightVectorAtDistanceAlongSpline(DistanceCm, ESplineCoordinateSpace::World);
	Owner->SetActorLocationAndRotation(Loc + Right * LaneOffsetCm, Rot, false, nullptr, ETeleportType::TeleportPhysics);
}
