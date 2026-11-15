#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CheatManager.h"
#include "GameFramework/PlayerController.h"
#include "RizePlayerController.generated.h"

/**
 * Yönetmen konsol komutları (~ tuşu). Örnekler:
 *   RizeSaat 18.5        — saati 18:30 yap
 *   RizeHizi 240         — zamanı hızlandır (1 gün = 6 dk)
 *   RizeHava Saganak     — sağanağı başlat (Acik, Bulutlu, Cisenti, Saganak, Sis)
 *   RizePara 5000        — cüzdana 5.000 TL ekle
 *   RizeKaydet / RizeYukle
 *   RizeVeriYenile       — JSON verilerini yeniden oku
 */
UCLASS()
class RIZESIM_API URizeCheatManager : public UCheatManager
{
	GENERATED_BODY()

public:
	UFUNCTION(Exec) void RizeSaat(float Hour);
	UFUNCTION(Exec) void RizeHizi(float TimeScale);
	UFUNCTION(Exec) void RizeHava(const FString& Weather);
	UFUNCTION(Exec) void RizePara(int32 Lira);
	UFUNCTION(Exec) void RizeKaydet();
	UFUNCTION(Exec) void RizeYukle();
	UFUNCTION(Exec) void RizeVeriYenile();
	UFUNCTION(Exec) void RizeDurum();
};

UCLASS()
class RIZESIM_API ARizePlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	ARizePlayerController();
};
