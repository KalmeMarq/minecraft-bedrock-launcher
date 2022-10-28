use std::{path::PathBuf, collections::HashMap, fs::File, sync::Mutex};

use log::info;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use time::OffsetDateTime;

use crate::{utils::{LauncherSave, LauncherLoad, get_versions_path, get_version_manifest_v2}, LauncherState, CoreConfig, versions::VersionManifestV2};

fn get_launcher_profiles_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("launcher_profiles.json")
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    #[serde(rename = "type")]
    profile_type: String,
    name: String,
    icon: String,
    #[serde(with = "time::serde::rfc3339")]
    created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    last_used: OffsetDateTime,
    version_id: String,
    last_time_played: u32,
    total_time_played: u32,
    dir_name: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Group {
    #[serde(default = "bool::default")]
    hidden: bool,
    installations: Vec<String>
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LauncherProfiles {
    profiles: HashMap<String, Profile>,
    groups: Vec<Group>
}

pub fn default_profiles() -> HashMap<String, Profile> {
    let lastest_release = Profile {
        profile_type: "latest-release".into(),
        name: "".into(),
        icon: "Grass_Block".into(),
        version_id: "latest-release".into(),
        last_time_played: 0,
        total_time_played: 0,
        dir_name: "Latest Release".into(),
        created: OffsetDateTime::now_utc(),
        last_used: OffsetDateTime::now_utc(),
    };

    let lastest_beta = Profile {
        profile_type: "latest-beta".into(),
        name: "".into(),
        icon: "Crafting_Table".into(),
        version_id: "latest-beta".into(),
        last_time_played: 0,
        total_time_played: 0,
        dir_name: "Latest Beta".into(),
        created: OffsetDateTime::now_utc(),
        last_used: OffsetDateTime::now_utc(),
    };

    let lastest_preview = Profile {
        profile_type: "latest-preview".into(),
        name: "".into(),
        icon: "Grass_Path".into(),
        version_id: "latest-preview".into(),
        last_time_played: 0,
        total_time_played: 0,
        dir_name: "Latest Preview".into(),
        created: OffsetDateTime::now_utc(),
        last_used: OffsetDateTime::now_utc(),
    };

    let mut map: HashMap<String, Profile> = HashMap::new();

    map.insert("e053b3cfbacad42b1269e2b0660be6a8".into(), lastest_release);
    map.insert("803f6aeac46b2e03c7be99f4c52defc5".into(), lastest_beta);
    map.insert("103f6aeac46b2e03c7be99f4c52defc6".into(), lastest_preview);

    map
}

impl Default for LauncherProfiles {
    fn default() -> Self {
        LauncherProfiles {
            profiles: default_profiles(),
            groups: Vec::new()
        }
    }
}

impl LauncherSave for LauncherProfiles {
    fn save(&self, _app_handle: &tauri::AppHandle, core_config: &CoreConfig) {
        info!("Saving launcher profiles");

        serde_json::to_writer_pretty(
            &File::create(get_launcher_profiles_path(&core_config.launcher_path)).expect("Could not save launcher profiles file"), 
            self
        ).expect("Could not save launcher profiles");
    } 
}

impl LauncherLoad<LauncherProfiles> for LauncherProfiles {
    fn load(app_handle: &tauri::AppHandle, core_config: &CoreConfig) -> LauncherProfiles {
        info!("Loading launcher profiles");

        let profiles_path = get_launcher_profiles_path(&core_config.launcher_path);

        let mut profiles: LauncherProfiles = LauncherProfiles::default();

        if profiles_path.exists() {
            let data = std::fs::read_to_string(profiles_path).expect("Could not read launcher profiles file");
            profiles = serde_json::from_str(&data).expect("Could not load launcher profiles");
        } else {
            profiles.save(app_handle,core_config);
        }

        profiles
    }
}

#[tauri::command]
pub fn get_profiles(state: tauri::State<LauncherState>) -> HashMap<String, Profile>  {
   state.profiles.lock().unwrap().profiles.clone()
}

#[derive(Serialize)]
pub struct ProfileResponse {
    title: Option<String>,
    message: Option<String>,
    success: bool
}

#[tauri::command]
pub fn create_profile(state: tauri::State<LauncherState>, id: String, name: String, icon: String, version_id: String, dir_name: String) {
    state.profiles.lock().unwrap().profiles.insert(id, Profile {
        profile_type: "custom".into(),
        name,
        icon,
        created: OffsetDateTime::now_utc(),
        last_used: OffsetDateTime::now_utc(),
        version_id,
        dir_name,
        last_time_played: 0,
        total_time_played: 0
    });
}

#[tauri::command]
pub fn update_profile(state: tauri::State<LauncherState>, id: String, name: Option<String>, icon: Option<String>, version_id: Option<String>, dir_name: Option<String>) -> ProfileResponse {
    if state.profiles.lock().unwrap().profiles.contains_key(&id) {
        let mut profile = state.profiles.lock().unwrap().profiles.get_mut(&id).unwrap().clone();

        if name.is_some() {
            profile.name = name.unwrap();
        }

        if icon.is_some() {
            profile.icon = icon.unwrap();
        }

        if version_id.is_some() {
            profile.version_id = version_id.unwrap();
        }

        if dir_name.is_some() {
            profile.dir_name = dir_name.unwrap();
        }

        state.profiles.lock().unwrap().profiles.insert(id, profile);

        ProfileResponse {
            title: None,
            message: None,
            success: true
        }
    } else {
        ProfileResponse {
            title: Some("Failed to update profile".into()),
            message: Some("Profile does not exist".into()),
            success: false
        }
    }
}

#[tauri::command]
pub fn duplicate_profile(state: tauri::State<LauncherState>, profile_id: String, duplicate_profile_id: String) -> ProfileResponse {
    if state.profiles.lock().unwrap().profiles.contains_key(&profile_id) {
        let mut profile = state.profiles.lock().unwrap().profiles.get_mut(&profile_id).unwrap().clone();
        profile.profile_type = "custom".into();
        profile.total_time_played = 0;
        profile.last_time_played = 0;

        state.profiles.lock().unwrap().profiles.insert(duplicate_profile_id, profile);

        ProfileResponse {
            title: None,
            message: None,
            success: true
        }
    } else {
        ProfileResponse {
            title: Some("Failed to duplicate profile".into()),
            message: Some("Profile does not exist".into()),
            success: false
        }
    }
}

#[tauri::command]
pub fn delete_profile(state: tauri::State<LauncherState>, profile_id: String) -> ProfileResponse {
    if state.profiles.lock().unwrap().profiles.contains_key(&profile_id) {
        state.profiles.lock().unwrap().profiles.remove(&profile_id).unwrap();
        
        ProfileResponse {
            title: None,
            message: None,
            success: true
        }
    } else {
        ProfileResponse {
            title: Some("Failed to delete profile".into()),
            message: Some("Profile does not exist".into()),
            success: false
        }
    }
}

#[derive(Serialize, Debug, Clone)]
pub struct ProgressStatusPreparing {
    status: String
}

#[derive(Serialize, Debug, Clone)]
pub struct ProgressStatusStop {
    status: String
}

#[derive(Serialize, Debug, Clone)]
pub struct ProgressStatusLaunching {
    status: String
}

#[derive(Serialize, Debug, Clone)]
pub struct ProgressStatusDownloading {
    status: String,
    current_size: u32,
    total_size: u32
}

#[derive(Serialize, Debug, Clone)]
pub enum ProgressStatusPayload {
    Preparing(ProgressStatusPreparing),
    ProgressStatusDownloading(ProgressStatusDownloading),
    Launching(ProgressStatusLaunching),
    Stop(ProgressStatusStop)
}

#[tauri::command]
async fn play_profile(app: tauri::AppHandle, window: tauri::Window, state: tauri::State<'_, LauncherState>, profile_id: String) -> Result<(), String> {
    window.emit("progress_status", ProgressStatusPayload::Preparing(ProgressStatusPreparing { status: "preparing".into() })).unwrap();
    
    if let Some(profile) = state.profiles.lock().unwrap().profiles.get(&profile_id).as_mut() {
        let vm_v2: VersionManifestV2 = serde_json::from_value(get_version_manifest_v2(app.state::<Mutex<CoreConfig>>()).await.unwrap()).unwrap();
        
        if let Some(uuid) = vm_v2.get_version_uuid(profile.version_id.clone(), "x64".into()) {
            let ver_path = get_versions_path(&app.state::<Mutex<CoreConfig>>().lock().unwrap().launcher_path).join(vec![profile.version_id.clone(), uuid].join("-"));

            // profile.icon = "".into();

            if ver_path.exists() {

            } else {
            }
        }

        Ok(())
    } else {
        Err("Profile does not exist, idiot".into())
    }
}