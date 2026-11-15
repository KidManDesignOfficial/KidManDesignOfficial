"""Unreal editöründe tek seferlik proje kurulumu. Mevcut varlıkların üzerine yazmaz.

    import rize_bootstrap as b; b.run()

Oluşturduğu varlıklar (/Game/Rize/...):
  Girdi/      IA_* girdi eylemleri, IMC_Yuruyus ve IMC_Surus eşleme bağlamları
  Ortam/      MPC_RizeOrtam (Wetness, Puddles, RainIntensity, FogDensity, Wind, SunElevation)
  Blueprint/  BP_RizeOyuncu (girdiler atanmış), BP_RizeOyunModu
Harita:
  /Game/Maps/Rize_Merkez — güneş + ay, SkyAtmosphere, SkyLight (gerçek zamanlı yakalama),
  ExponentialHeightFog (hacimsel), VolumetricCloud, PostProcess, RizeSkyController (bağlı),
  ev başlangıç noktaları (Content/Data/home_spawns.json).

Her adım ayrı denenir; biri başarısız olursa günlükte nedeni yazar ve diğerleri sürer.
"""
from __future__ import annotations

import json
import os

import unreal

ROOT = "/Game/Rize"
tools = unreal.AssetToolsHelpers.get_asset_tools()
eal = unreal.EditorAssetLibrary
actor_sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
REPORT: list[str] = []


def note(msg: str) -> None:
    REPORT.append(msg)
    unreal.log(f"[Rize kurulum] {msg}")


def step(fn):
    def wrapper(*a, **k):
        try:
            return fn(*a, **k)
        except Exception as exc:  # noqa: BLE001
            note(f"UYARI {fn.__name__}: {type(exc).__name__}: {exc}")
            return None
    wrapper.__name__ = fn.__name__
    return wrapper


def get_or_create(name: str, folder: str, asset_class, factory):
    path = f"{folder}/{name}"
    if eal.does_asset_exist(path):
        return eal.load_asset(path)
    asset = tools.create_asset(name, folder, asset_class, factory)
    note(f"oluşturuldu: {path}")
    return asset


# ---- Girdi ------------------------------------------------------------------------

ACTIONS = {
    # ad: değer türü
    "IA_Hareket": unreal.InputActionValueType.AXIS2D,
    "IA_Bakis": unreal.InputActionValueType.AXIS2D,
    "IA_Etkilesim": unreal.InputActionValueType.BOOLEAN,
    "IA_Ikincil": unreal.InputActionValueType.BOOLEAN,
    "IA_HizliAdim": unreal.InputActionValueType.BOOLEAN,
    "IA_Zipla": unreal.InputActionValueType.BOOLEAN,
    "IA_Gaz": unreal.InputActionValueType.AXIS1D,
    "IA_Fren": unreal.InputActionValueType.AXIS1D,
    "IA_Direksiyon": unreal.InputActionValueType.AXIS1D,
    "IA_ElFreni": unreal.InputActionValueType.BOOLEAN,
    "IA_AractanIn": unreal.InputActionValueType.BOOLEAN,
}


def _key(name: str) -> unreal.Key:
    k = unreal.Key()
    k.import_text(name)
    return k


def _mapping(action, key: str, modifiers=()):
    m = unreal.EnhancedActionKeyMapping()
    m.set_editor_property("action", action)
    m.set_editor_property("key", _key(key))
    m.set_editor_property("modifiers", list(modifiers))
    return m


def _negate():
    return unreal.InputModifierNegate()


def _swizzle():
    s = unreal.InputModifierSwizzleAxis()
    s.set_editor_property("order", unreal.InputAxisSwizzle.YXZ)
    return s


@step
def create_input() -> dict:
    folder = f"{ROOT}/Girdi"
    ia = {}
    for name, vtype in ACTIONS.items():
        a = get_or_create(name, folder, unreal.InputAction, unreal.InputAction_Factory())
        a.set_editor_property("value_type", vtype)
        eal.save_loaded_asset(a)
        ia[name] = a

    walk = get_or_create("IMC_Yuruyus", folder, unreal.InputMappingContext, unreal.InputMappingContext_Factory())
    walk_maps = [
        _mapping(ia["IA_Hareket"], "W", [_swizzle()]),
        _mapping(ia["IA_Hareket"], "S", [_swizzle(), _negate()]),
        _mapping(ia["IA_Hareket"], "D"),
        _mapping(ia["IA_Hareket"], "A", [_negate()]),
        _mapping(ia["IA_Hareket"], "Gamepad_Left2D"),
        _mapping(ia["IA_Bakis"], "Mouse2D", [_negate_y()]),
        _mapping(ia["IA_Bakis"], "Gamepad_Right2D", [_negate_y()]),
        _mapping(ia["IA_Etkilesim"], "E"),
        _mapping(ia["IA_Etkilesim"], "Gamepad_FaceButton_Left"),
        _mapping(ia["IA_Ikincil"], "Q"),
        _mapping(ia["IA_HizliAdim"], "LeftShift"),
        _mapping(ia["IA_Zipla"], "SpaceBar"),
    ]
    _set_mappings(walk, walk_maps)

    drive = get_or_create("IMC_Surus", folder, unreal.InputMappingContext, unreal.InputMappingContext_Factory())
    drive_maps = [
        _mapping(ia["IA_Gaz"], "W"), _mapping(ia["IA_Gaz"], "Gamepad_RightTriggerAxis"),
        _mapping(ia["IA_Fren"], "S"), _mapping(ia["IA_Fren"], "Gamepad_LeftTriggerAxis"),
        _mapping(ia["IA_Direksiyon"], "D"), _mapping(ia["IA_Direksiyon"], "A", [_negate()]),
        _mapping(ia["IA_Direksiyon"], "Gamepad_LeftX"),
        _mapping(ia["IA_ElFreni"], "SpaceBar"),
        _mapping(ia["IA_AractanIn"], "F"),
        _mapping(ia["IA_Bakis"], "Mouse2D", [_negate_y()]),
    ]
    _set_mappings(drive, drive_maps)
    return {"ia": ia, "walk": walk, "drive": drive}


def _negate_y():
    n = unreal.InputModifierNegate()
    n.set_editor_property("x", False)
    n.set_editor_property("y", True)
    n.set_editor_property("z", False)
    return n


def _set_mappings(imc, maps) -> None:
    # UE 5.x: 'mappings' (FInputMappingContext::Mappings). Sürüm farkı olursa map_key ile yedek.
    try:
        imc.set_editor_property("mappings", maps)
    except Exception:  # noqa: BLE001
        imc.unmap_all()
        for m in maps:
            imc.map_key(m.get_editor_property("action"), m.get_editor_property("key"))
        note(f"{imc.get_name()}: değiştiriciler (Negate/Swizzle) elle eklenmeli — API bu sürümde farklı")
    eal.save_loaded_asset(imc)


# ---- Ortam ---------------------------------------------------------------------------

MPC_PARAMS = {"Wetness": 0.0, "Puddles": 0.0, "RainIntensity": 0.0, "FogDensity": 0.02, "Wind": 0.2, "SunElevation": 45.0}


@step
def create_mpc():
    folder = f"{ROOT}/Ortam"
    mpc = get_or_create("MPC_RizeOrtam", folder, unreal.MaterialParameterCollection, unreal.MaterialParameterCollectionFactoryNew())
    existing = {str(p.get_editor_property("parameter_name")) for p in mpc.get_editor_property("scalar_parameters")}
    params = list(mpc.get_editor_property("scalar_parameters"))
    for name, default in MPC_PARAMS.items():
        if name in existing:
            continue
        p = unreal.CollectionScalarParameter()
        p.set_editor_property("parameter_name", name)
        p.set_editor_property("default_value", default)
        params.append(p)
    mpc.set_editor_property("scalar_parameters", params)
    eal.save_loaded_asset(mpc)
    return mpc


# ---- Blueprint'ler -----------------------------------------------------------------------

def _blueprint(name: str, parent):
    folder = f"{ROOT}/Blueprint"
    f = unreal.BlueprintFactory()
    f.set_editor_property("parent_class", parent)
    bp = get_or_create(name, folder, unreal.Blueprint, f)
    return bp


@step
def create_player_bp(inputs):
    bp = _blueprint("BP_RizeOyuncu", unreal.RizePlayerCharacter)
    cdo = unreal.get_default_object(bp.generated_class())
    if inputs:
        ia = inputs["ia"]
        for prop, key in (("default_mapping", None), ("move_action", "IA_Hareket"), ("look_action", "IA_Bakis"),
                          ("interact_action", "IA_Etkilesim"), ("secondary_action", "IA_Ikincil"),
                          ("brisk_walk_action", "IA_HizliAdim"), ("jump_action", "IA_Zipla")):
            cdo.set_editor_property(prop, inputs["walk"] if key is None else ia[key])
    unreal.BlueprintEditorLibrary.compile_blueprint(bp)
    eal.save_loaded_asset(bp)
    return bp


@step
def create_gamemode_bp(player_bp):
    bp = _blueprint("BP_RizeOyunModu", unreal.RizeGameMode)
    if player_bp:
        cdo = unreal.get_default_object(bp.generated_class())
        cdo.set_editor_property("default_pawn_class", player_bp.generated_class())
    unreal.BlueprintEditorLibrary.compile_blueprint(bp)
    eal.save_loaded_asset(bp)
    return bp


# ---- Harita --------------------------------------------------------------------------------

def _spawn(cls, loc=(0, 0, 0), rot=(0, 0, 0), label=""):
    a = actor_sub.spawn_actor_from_class(cls, unreal.Vector(*loc), unreal.Rotator(*rot))
    if label:
        a.set_actor_label(label)
    a.set_folder_path("Rize/Atmosfer")
    return a


@step
def create_map(gamemode_bp):
    level_sub = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
    path = "/Game/Maps/Rize_Merkez"
    if eal.does_asset_exist(path):
        note(f"{path} zaten var — harita kurulumu atlandı")
        return
    level_sub.new_level(path)

    sun = _spawn(unreal.DirectionalLight, (0, 0, 50000), label="Gunes")
    sun.light_component.set_editor_property("atmosphere_sun_light", True)
    sun.light_component.set_editor_property("atmosphere_sun_light_index", 0)
    sun.light_component.set_editor_property("mobility", unreal.ComponentMobility.MOVABLE)
    moon = _spawn(unreal.DirectionalLight, (0, 0, 50000), label="Ay")
    moon.light_component.set_editor_property("atmosphere_sun_light", True)
    moon.light_component.set_editor_property("atmosphere_sun_light_index", 1)
    moon.light_component.set_editor_property("intensity", 0.0)
    moon.light_component.set_editor_property("light_color", unreal.Color(200, 215, 255, 255))
    moon.light_component.set_editor_property("mobility", unreal.ComponentMobility.MOVABLE)

    _spawn(unreal.SkyAtmosphere, label="Atmosfer")
    sky = _spawn(unreal.SkyLight, (0, 0, 2000), label="GokIsigi")
    sky.light_component.set_editor_property("real_time_capture", True)
    sky.light_component.set_editor_property("mobility", unreal.ComponentMobility.MOVABLE)
    fog = _spawn(unreal.ExponentialHeightFog, label="Sis")
    fog.component.set_editor_property("volumetric_fog", True)
    _spawn(unreal.VolumetricCloud, label="Bulutlar")
    pp = _spawn(unreal.PostProcessVolume, label="SonIsleme")
    pp.set_editor_property("unbound", True)

    ctrl = _spawn(unreal.RizeSkyController, label="GokyuzuKontrol")
    ctrl.set_editor_property("sun_light", sun)
    ctrl.set_editor_property("moon_light", moon)
    ctrl.set_editor_property("sky_light", sky)
    ctrl.set_editor_property("height_fog", fog)

    # Ev başlangıç noktaları (yayla evi ayrı haritada: Rize_Ayder)
    spawns_path = os.path.join(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_content_dir()), "Data", "home_spawns.json")
    if os.path.exists(spawns_path):
        with open(spawns_path, encoding="utf-8") as f:
            homes = json.load(f)
        for key, h in homes.items():
            if h["map"] != "merkez":
                continue
            ps = actor_sub.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(*h["location_cm"]), unreal.Rotator(0, 0, -90))
            ps.set_editor_property("player_start_tag", h["player_start_tag"])
            ps.set_actor_label(f"Baslangic_{key}")
            ps.set_folder_path("Rize/Baslangic")

    if gamemode_bp:
        ws = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world().get_world_settings()
        ws.set_editor_property("default_game_mode", gamemode_bp.generated_class())
    level_sub.save_current_level()
    note(f"harita oluşturuldu: {path} (Landscape'i Content/Terrain/merkez_heightmap.png ile ekleyin)")


def run() -> list[str]:
    REPORT.clear()
    inputs = create_input()
    create_mpc()
    player = create_player_bp(inputs)
    gm = create_gamemode_bp(player)
    create_map(gm)
    note("bitti")
    return REPORT
