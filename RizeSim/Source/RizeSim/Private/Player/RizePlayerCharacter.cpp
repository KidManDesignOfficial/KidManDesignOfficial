#include "Player/RizePlayerCharacter.h"

#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Engine/LocalPlayer.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "Interaction/RizeInteractable.h"
#include "Player/RizeWalletComponent.h"
#include "TimerManager.h"

ARizePlayerCharacter::ARizePlayerCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	GetCapsuleComponent()->InitCapsuleSize(34.f, 88.f);

	Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("FirstPersonCamera"));
	Camera->SetupAttachment(GetCapsuleComponent());
	Camera->SetRelativeLocation(CameraBaseOffset);
	Camera->bUsePawnControlRotation = true;
	Camera->SetFieldOfView(80.f);

	Wallet = CreateDefaultSubobject<URizeWalletComponent>(TEXT("Wallet"));

	UCharacterMovementComponent* Move = GetCharacterMovement();
	Move->MaxWalkSpeed = StrollSpeed;
	Move->MaxAcceleration = 600.f;            // yumuşak kalkış
	Move->BrakingDecelerationWalking = 900.f;
	Move->GroundFriction = 6.f;
	Move->SetWalkableFloorAngle(50.f);       // Rize'nin dik yokuşları yürünebilir olmalı
	Move->MaxStepHeight = 30.f;              // merdiven basamakları (~17 cm) rahat çıkılır
	Move->JumpZVelocity = 300.f;
	Move->bCanWalkOffLedgesWhenCrouching = false;
	Move->GetNavAgentPropertiesRef().bCanCrouch = false;

	bUseControllerRotationYaw = true;
}

void ARizePlayerCharacter::BeginPlay()
{
	Super::BeginPlay();
	GetWorldTimerManager().SetTimer(FocusTimer, this, &ARizePlayerCharacter::UpdateFocus, 0.1f, true);
}

void ARizePlayerCharacter::NotifyControllerChanged()
{
	Super::NotifyControllerChanged();
	if (APlayerController* PC = Cast<APlayerController>(Controller))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Sub = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			if (DefaultMapping) Sub->AddMappingContext(DefaultMapping, 0);
		}
	}
}

void ARizePlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
	UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent);
	if (!EIC) return;

	if (MoveAction)      EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &ARizePlayerCharacter::OnMove);
	if (LookAction)      EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &ARizePlayerCharacter::OnLook);
	if (InteractAction)  EIC->BindAction(InteractAction, ETriggerEvent::Started, this, &ARizePlayerCharacter::OnInteract);
	if (SecondaryAction) EIC->BindAction(SecondaryAction, ETriggerEvent::Started, this, &ARizePlayerCharacter::OnSecondary);
	if (BriskWalkAction)
	{
		EIC->BindAction(BriskWalkAction, ETriggerEvent::Started, this, &ARizePlayerCharacter::OnBriskStart);
		EIC->BindAction(BriskWalkAction, ETriggerEvent::Completed, this, &ARizePlayerCharacter::OnBriskStop);
	}
	if (JumpAction)      EIC->BindAction(JumpAction, ETriggerEvent::Started, this, &ACharacter::Jump);
}

void ARizePlayerCharacter::OnMove(const FInputActionValue& Value)
{
	if (bSeated || !Controller) return;
	const FVector2D Axis = Value.Get<FVector2D>();
	const FRotator Yaw(0.0, Controller->GetControlRotation().Yaw, 0.0);
	AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::X), Axis.Y);
	AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y), Axis.X);
}

void ARizePlayerCharacter::OnLook(const FInputActionValue& Value)
{
	const FVector2D Axis = Value.Get<FVector2D>();
	AddControllerYawInput(Axis.X);
	AddControllerPitchInput(Axis.Y);
}

void ARizePlayerCharacter::OnBriskStart() { bBrisk = true; }
void ARizePlayerCharacter::OnBriskStop() { bBrisk = false; }

void ARizePlayerCharacter::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	UpdateWalkFeel(DeltaSeconds);
}

void ARizePlayerCharacter::UpdateWalkFeel(float DeltaSeconds)
{
	UCharacterMovementComponent* Move = GetCharacterMovement();
	if (!Move || bSeated) return;

	// Eğim etkisi: yokuş yukarı yürürken yavaşla (zemin normali ile hız yönü)
	float SlopeFactor = 1.f;
	if (Move->CurrentFloor.IsWalkableFloor())
	{
		const FVector N = Move->CurrentFloor.HitResult.ImpactNormal;
		const FVector V = Move->Velocity.GetSafeNormal2D();
		const float Uphill = -FVector::DotProduct(FVector(N.X, N.Y, 0.f), V); // >0 ise yokuş yukarı
		const float Grade = FMath::Clamp(Uphill / FMath::Max(N.Z, 0.2f), 0.f, 0.6f);
		SlopeFactor = FMath::Lerp(1.f, SteepUphillFactor, FMath::Clamp(Grade / 0.3f, 0.f, 1.f));
	}
	const float Target = (bBrisk ? BriskSpeed : StrollSpeed) * SlopeFactor;
	Move->MaxWalkSpeed = FMath::FInterpTo(Move->MaxWalkSpeed, Target, DeltaSeconds, 4.f);

	// Kafa sallanması: hızla orantılı, düşük genlik
	const float Speed2D = Move->Velocity.Size2D();
	if (HeadBobAmplitude > 0.f && Move->IsMovingOnGround() && Speed2D > 10.f)
	{
		BobPhase += DeltaSeconds * Speed2D * 0.045f;
		const float Z = FMath::Sin(BobPhase) * HeadBobAmplitude * (Speed2D / BriskSpeed);
		Camera->SetRelativeLocation(CameraBaseOffset + FVector(0, 0, Z));
	}
	else
	{
		Camera->SetRelativeLocation(FMath::VInterpTo(Camera->GetRelativeLocation(), CameraBaseOffset, DeltaSeconds, 6.f));
	}
}

void ARizePlayerCharacter::UpdateFocus()
{
	AActor* NewFocus = nullptr;
	if (bSeated && SeatOwner.IsValid() && SeatOwner->Implements<URizeInteractable>())
	{
		NewFocus = SeatOwner.Get();
		// İpucu metni değişebilir ("inecek var" → "sonraki durakta"): her seferinde yayınla
		OnFocusChanged.Broadcast(IRizeInteractable::Execute_GetInteractionPrompt(NewFocus, this), FText::GetEmpty());
		FocusedActor = NewFocus;
		return;
	}
	const FVector Start = Camera->GetComponentLocation();
	const FVector End = Start + Camera->GetForwardVector() * InteractRange;
	FHitResult Hit;
	FCollisionQueryParams Params(SCENE_QUERY_STAT(RizeInteract), false, this);
	if (GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params))
	{
		AActor* A = Hit.GetActor();
		if (A && A->Implements<URizeInteractable>() && IRizeInteractable::Execute_CanInteract(A, this))
		{
			NewFocus = A;
		}
	}

	if (NewFocus != FocusedActor.Get())
	{
		FocusedActor = NewFocus;
		if (NewFocus)
		{
			OnFocusChanged.Broadcast(IRizeInteractable::Execute_GetInteractionPrompt(NewFocus, this),
			                         IRizeInteractable::Execute_GetSecondaryPrompt(NewFocus, this));
		}
		else
		{
			OnFocusChanged.Broadcast(FText::GetEmpty(), FText::GetEmpty());
		}
	}
}

void ARizePlayerCharacter::OnInteract()
{
	AActor* A = bSeated && SeatOwner.IsValid() ? SeatOwner.Get() : FocusedActor.Get();
	if (A && A->Implements<URizeInteractable>())
	{
		IRizeInteractable::Execute_Interact(A, this);
		// Durum değişmiş olabilir (kapı açıldı, sepet doldu): ipucunu tazele
		FocusedActor = nullptr;
		UpdateFocus();
	}
}

void ARizePlayerCharacter::OnSecondary()
{
	AActor* A = FocusedActor.Get();
	if (A && A->Implements<URizeInteractable>())
	{
		IRizeInteractable::Execute_InteractSecondary(A, this);
		FocusedActor = nullptr;
		UpdateFocus();
	}
}

void ARizePlayerCharacter::SitAt(USceneComponent* Seat)
{
	if (!Seat) return;
	bSeated = true;
	SeatOwner = Seat->GetOwner();
	GetCharacterMovement()->DisableMovement();
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	AttachToComponent(Seat, FAttachmentTransformRules::SnapToTargetNotIncludingScale);
	Camera->SetRelativeLocation(CameraBaseOffset = FVector(0, 0, 40.f)); // oturuş göz hizası
}

void ARizePlayerCharacter::StandUpAt(const FVector& Location, const FRotator& Facing)
{
	DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);
	SetActorLocation(Location, false, nullptr, ETeleportType::TeleportPhysics);
	if (Controller) Controller->SetControlRotation(Facing);
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	GetCharacterMovement()->SetMovementMode(MOVE_Walking);
	Camera->SetRelativeLocation(CameraBaseOffset = FVector(0, 0, 64.f));
	bSeated = false;
	SeatOwner.Reset();
}

void ARizePlayerCharacter::ShowSubtitle(const FText& Speaker, const FText& Line)
{
	OnSubtitle.Broadcast(Speaker, Line);
}
