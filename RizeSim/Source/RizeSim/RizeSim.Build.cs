using UnrealBuildTool;

public class RizeSim : ModuleRules
{
	public RizeSim(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		CppStandard = CppStandardVersion.Cpp20;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"DeveloperSettings",
			"Json",
			"JsonUtilities",
			"Niagara",
			"ChaosVehicles",
			"PhysicsCore",
			"UMG",
			"AudioMixer",
			"AIModule",
			"NavigationSystem"
		});
	}
}
