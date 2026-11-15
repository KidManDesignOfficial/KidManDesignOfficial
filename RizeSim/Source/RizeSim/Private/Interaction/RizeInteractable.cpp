#include "Interaction/RizeInteractable.h"

FText IRizeInteractable::GetInteractionPrompt_Implementation(AActor* Interactor) const { return FText::GetEmpty(); }
FText IRizeInteractable::GetSecondaryPrompt_Implementation(AActor* Interactor) const { return FText::GetEmpty(); }
bool IRizeInteractable::CanInteract_Implementation(AActor* Interactor) const { return true; }
void IRizeInteractable::Interact_Implementation(AActor* Interactor) {}
void IRizeInteractable::InteractSecondary_Implementation(AActor* Interactor) {}
