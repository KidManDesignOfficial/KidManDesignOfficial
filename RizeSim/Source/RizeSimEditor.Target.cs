using UnrealBuildTool;

public class RizeSimEditorTarget : TargetRules
{
	public RizeSimEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
		ExtraModuleNames.Add("RizeSim");
	}
}
