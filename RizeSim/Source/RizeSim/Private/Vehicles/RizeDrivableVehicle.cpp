#include "Vehicles/RizeDrivableVehicle.h"

#include "Camera/CameraComponent.h"
#include "ChaosVehicleWheel.h"
#include "ChaosWheeledVehicleMovementComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Core/RizeSimSettings.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Engine/LocalPlayer.h"
#include "GameFramework/PlayerController.h"
#include "PhysicalMaterials/PhysicalMaterial.h"
#include "Player/RizePlayerCharacter.h"
#include "Weather/RizeWeatherSubsystem.h"

#define LOCTEXT_NAMESPACE "RizeVehicle"

ARizeDrivableVehicle::ARizeDrivableVehicle()
{
	PrimaryActorTick.bCanEverTick = true;

	CockpitCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("CockpitCamera"));
	CockpitCamera->SetupAttachment(GetMesh());
	CockpitCamera->SetRelativeLocation(FVector(-20.f, -36.f, 118.f)); // sol direksiyon, göz hizası (araç başına BP'de ayarlanır)
	CockpitCamera->SetFieldOfView(75.f);
	CockpitCamera->bUsePawnControlRotation = false;

	ExitPoint = CreateDefaultSubobject<USceneComponent>(TEXT("ExitPoint"));
	ExitPoint->SetupAttachment(GetMesh());
	ExitPoint->SetRelativeLocation(FVector(0.f, -170.f, 100.f));

	// "Araca bin" etkileşimi için gövde Visibility ışınını engellemeli
	GetMesh()->SetCollisionResponseToChannel(ECC_Visibility, ECR_Block);
}

float ARizeDrivableVehicle::GetSpeedKmh() const
{
	return GetVehicleMovementComponent() ? GetVehicleMovementComponent()->GetForwardSpeed() * 0.036f : 0.f;
}

void ARizeDrivableVehicle::NotifyControllerChanged()
{
	Super::NotifyControllerChanged();
	if (APlayerController* PC = Cast<APlayerController>(Controller))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Sub = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			if (DrivingMapping) Sub->AddMappingContext(DrivingMapping, 1);
		}
	}
}

void ARizeDrivableVehicle::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
	UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent);
	if (!EIC) return;

	if (ThrottleAction)
	{
		EIC->BindAction(ThrottleAction, ETriggerEvent::Triggered, this, &ARizeDrivableVehicle::OnThrottle);
		EIC->BindAction(ThrottleAction, ETriggerEvent::Completed, this, &ARizeDrivableVehicle::OnThrottle);
	}
	if (BrakeAction)
	{
		EIC->BindAction(BrakeAction, ETriggerEvent::Triggered, this, &ARizeDrivableVehicle::OnBrake);
		EIC->BindAction(BrakeAction, ETriggerEvent::Completed, this, &ARizeDrivableVehicle::OnBrake);
	}
	if (SteerAction)
	{
		EIC->BindAction(SteerAction, ETriggerEvent::Triggered, this, &ARizeDrivableVehicle::OnSteer);
		EIC->BindAction(SteerAction, ETriggerEvent::Completed, this, &ARizeDrivableVehicle::OnSteer);
	}
	if (HandbrakeAction)
	{
		EIC->BindAction(HandbrakeAction, ETriggerEvent::Started, this, &ARizeDrivableVehicle::OnHandbrake);
		EIC->BindAction(HandbrakeAction, ETriggerEvent::Completed, this, &ARizeDrivableVehicle::OnHandbrake);
	}
	if (LookAction) EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &ARizeDrivableVehicle::OnLook);
	if (ExitAction) EIC->BindAction(ExitAction, ETriggerEvent::Started, this, &ARizeDrivableVehicle::OnExit);
}

void ARizeDrivableVehicle::OnThrottle(const FInputActionValue& V) { GetVehicleMovementComponent()->SetThrottleInput(V.Get<float>()); }
void ARizeDrivableVehicle::OnSteer(const FInputActionValue& V) { GetVehicleMovementComponent()->SetSteeringInput(V.Get<float>()); }
void ARizeDrivableVehicle::OnHandbrake(const FInputActionValue& V) { GetVehicleMovementComponent()->SetHandbrakeInput(V.Get<bool>()); }

void ARizeDrivableVehicle::OnBrake(const FInputActionValue& V)
{
	// Bakımsız fren daha az etkili
	GetVehicleMovementComponent()->SetBrakeInput(V.Get<float>() * FMath::Lerp(0.7f, 1.f, ServiceCondition));
}

void ARizeDrivableVehicle::OnLook(const FInputActionValue& V)
{
	// Kokpitte baş çevirme: sınırlı açı (yan cama, aynalara bakmak için)
	const FVector2D A = V.Get<FVector2D>();
	CockpitLook.Yaw = FMath::Clamp(CockpitLook.Yaw + A.X, -110.f, 110.f);
	CockpitLook.Pitch = FMath::Clamp(CockpitLook.Pitch + A.Y, -40.f, 30.f);
	CockpitCamera->SetRelativeRotation(CockpitLook);
}

void ARizeDrivableVehicle::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	UpdateGrip();

	// Aşınma ve kilometre
	const double Meters = FMath::Abs(GetVehicleMovementComponent()->GetForwardSpeed()) * DeltaSeconds / 100.0;
	OdometerMeters += Meters;
	TireCondition = FMath::Max(0.f, TireCondition - (float)(Meters * TireWearPerMeter));
	ServiceCondition = FMath::Max(0.f, ServiceCondition - (float)(Meters * ServiceWearPerMeter));

	// Bıraktığımızda başını yavaşça yola döndür
	if (Driver.IsValid() && CockpitLook.Yaw != 0.f && FMath::Abs(GetSpeedKmh()) > 15.f)
	{
		CockpitLook = FMath::RInterpTo(CockpitLook, FRotator::ZeroRotator, DeltaSeconds, 0.8f);
		CockpitCamera->SetRelativeRotation(CockpitLook);
	}
}

void ARizeDrivableVehicle::UpdateGrip()
{
	UChaosWheeledVehicleMovementComponent* Move = Cast<UChaosWheeledVehicleMovementComponent>(GetVehicleMovementComponent());
	const URizeWeatherSubsystem* Weather = GetWorld()->GetSubsystem<URizeWeatherSubsystem>();
	if (!Move) return;

	const URizeSimSettings* S = URizeSimSettings::Get();
	const float TireFactor = FMath::Lerp(0.7f, 1.f, TireCondition);
	float GripSum = 0.f;
	for (int32 i = 0; i < Move->Wheels.Num(); ++i)
	{
		ERizeSurface Surface = ERizeSurface::Asfalt;
		if (UChaosVehicleWheel* W = Move->Wheels[i])
		{
			if (const UPhysicalMaterial* PM = W->GetContactSurfaceMaterial())
			{
				if (const ERizeSurface* Mapped = S->SurfaceMap.Find(PM->SurfaceType)) Surface = *Mapped;
			}
		}
		const float Grip = (Weather ? Weather->GetSurfaceGrip(Surface) : 1.f) * TireFactor;
		Move->SetWheelFrictionMultiplier(i, Grip);
		GripSum += Grip;
	}
	CurrentGrip = Move->Wheels.Num() > 0 ? GripSum / Move->Wheels.Num() : 1.f;
}

bool ARizeDrivableVehicle::CanInteract_Implementation(AActor* Interactor) const
{
	return bOwnedByPlayer && !Driver.IsValid();
}

FText ARizeDrivableVehicle::GetInteractionPrompt_Implementation(AActor* Interactor) const
{
	return LOCTEXT("Enter", "Araca bin");
}

void ARizeDrivableVehicle::Interact_Implementation(AActor* Interactor)
{
	ARizePlayerCharacter* P = Cast<ARizePlayerCharacter>(Interactor);
	APlayerController* PC = P ? Cast<APlayerController>(P->GetController()) : nullptr;
	if (!PC) return;

	Driver = P;
	P->SitAt(GetMesh()); // karakter araçla gider (görünmez), kontrol araca geçer
	P->SetActorHiddenInGame(true);
	CockpitLook = FRotator::ZeroRotator;
	CockpitCamera->SetRelativeRotation(CockpitLook);
	PC->Possess(this);
}

void ARizeDrivableVehicle::OnExit()
{
	ARizePlayerCharacter* P = Driver.Get();
	APlayerController* PC = Cast<APlayerController>(Controller);
	if (!P || !PC) return;
	if (FMath::Abs(GetSpeedKmh()) > 5.f) return; // seyir halinde inilmez

	GetVehicleMovementComponent()->SetThrottleInput(0.f);
	GetVehicleMovementComponent()->SetHandbrakeInput(true); // el freni çekili bırak (yokuşta kaymasın)
	PC->Possess(P);
	P->SetActorHiddenInGame(false);
	P->StandUpAt(ExitPoint->GetComponentLocation(), FRotator(0.f, GetActorRotation().Yaw, 0.f));
	Driver.Reset();
}

#undef LOCTEXT_NAMESPACE
