#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod utils;
pub mod profiles;
pub mod settings;
pub mod themes;
pub mod versions;

use std::{sync::Mutex, path::PathBuf, fs::{File, self}};

use fs_extra::{move_items, dir};
use log::info;
use profiles::LauncherProfiles;
use settings::{LauncherSettings};
use tauri::{WindowBuilder, WindowUrl, Manager};
use themes::LauncherThemes;
use utils::{create_launcher_dirs, get_cache_path, LauncherSave};
use serde::{Deserialize, Serialize};

use crate::{utils::{init_logger, LauncherLoad}};

#[allow(dead_code)]
pub struct LauncherState {
    pub settings: Mutex<LauncherSettings>,
    pub profiles: Mutex<LauncherProfiles>,
    pub themes: Mutex<LauncherThemes>
}

impl LauncherState {
    fn save(&self, app_handle: &tauri::AppHandle, core_config: &CoreConfig) {
        self.settings.lock().unwrap().save(app_handle, core_config);
        self.profiles.lock().unwrap().save(app_handle, core_config);
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[tauri::command]
async fn test_stuff(window: tauri::Window) -> Result<(), String> {
    window.emit("test-event", Payload { message: "Event from rust".into() }).unwrap();

    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct CoreConfig {
    last_launcher_path: PathBuf,
    launcher_path: PathBuf
}

impl Default for CoreConfig {
    fn default() -> Self {
        Self {
            last_launcher_path: dirs::data_dir().unwrap().join(".minecraft_bedrock_launcher"),
            launcher_path: dirs::data_dir().unwrap().join(".minecraft_bedrock_launcher")
        }
    }
}

impl CoreConfig {
    fn save(&self, app_handle: &tauri::AppHandle) {
        serde_json::to_writer(
            &File::create(app_handle.path_resolver().app_dir().unwrap().join(".core-config")).expect("Could not save core config file"), 
            self
        ).expect("Could not save core config");
    }

    fn set_launcher_path(&mut self, app: &tauri::AppHandle, new_launcher_path: String) {
        self.last_launcher_path = self.launcher_path.clone();
        self.launcher_path = PathBuf::from(new_launcher_path);
        println!("Changed path");
        self.save(app);
        println!("Saved new path");
    }

    fn load(app_handle: &tauri::AppHandle) -> CoreConfig {
        let file_path = app_handle.path_resolver().app_dir().unwrap().join(".core-config");

        let mut config = CoreConfig::default();

        if file_path.exists() {
            let data = fs::read_to_string(file_path).expect("Could not read core config");
            config = serde_json::from_str(&data).expect("Could not load core config")
        } else {
            config.save(app_handle);
        }

        if config.launcher_path != config.last_launcher_path {
            println!("Moving launcher content to new directory");

            if !config.launcher_path.exists() {
                fs::create_dir(&config.launcher_path).expect("Could not create new launcher directory");
            }

            let options = dir::CopyOptions::new();
            let from_paths = fs::read_dir(&config.last_launcher_path).unwrap()
                .map(|res| res.map(|e| e.path()))
                .collect::<Result<Vec<_>, std::io::Error>>().unwrap();

            move_items(&from_paths, &config.launcher_path, &options).unwrap();

            if config.last_launcher_path.exists() {
                fs::remove_dir(&config.last_launcher_path).expect("Could not delete previous launcher directory");
            }

            config.last_launcher_path = config.launcher_path.clone();
            config.save(app_handle);
            
            println!("Moved launcher content");
        }

        config
    }
}

#[tauri::command]
fn change_launcher_path(app: tauri::AppHandle, new_launcher_path: String) -> Result<(), ()> {
    app.state::<Mutex<CoreConfig>>().lock().unwrap().set_launcher_path(&app, new_launcher_path);

    Ok(())
}

#[tauri::command]
async fn get_launcher_path(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<String, ()> {
    Ok(state.lock().unwrap().launcher_path.to_str().unwrap().to_string())
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let core_config = CoreConfig::load(&app.app_handle());
            init_logger(app.app_handle(), &core_config);

            create_launcher_dirs(&core_config.launcher_path);

            info!("Launcher path: {:?}", &core_config.launcher_path);

            info!("Creating core window");
            
            let main_win = WindowBuilder::new(app, "core", WindowUrl::App("index.html".into()))
                .data_directory(get_cache_path(&core_config.launcher_path))
                .inner_size(1000.0, 600.0)
                .min_inner_size(1000.0, 600.0)
                .title("Minecraft Bedrock Launcher")
                .visible(false)
                .build()?;

            let settings = LauncherSettings::load(&main_win.app_handle(), &core_config);
            let profiles = LauncherProfiles::load(&main_win.app_handle(), &core_config);
            let themes = LauncherThemes::load(&main_win.app_handle(), &core_config);

            main_win.manage(LauncherState {
                settings: Mutex::from(settings),
                profiles: Mutex::from(profiles),
                themes: Mutex::from(themes)
            });

            main_win.manage(Mutex::from(core_config));

            info!("Window creation finished");

            main_win.show().unwrap();

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Destroyed => {
                if event.window().label() == "core" {
                    let app = event.window().app_handle();
                    event.window().app_handle().state::<LauncherState>().save(&app, &app.state::<Mutex<CoreConfig>>().lock().unwrap());
                }
            }
            _ => {}
          })
        .invoke_handler(tauri::generate_handler![
            test_stuff,
            change_launcher_path,
            get_launcher_path,
            versions::get_local_versions,
            utils::pick_folder,
            utils::get_news_minecraft,
            utils::get_news_minecraft_forum,
            utils::get_news_minecraft_top,
            utils::get_launcher_patch_notes,
            utils::get_bedrock_patch_notes,
            utils::get_version_manifest,
            utils::get_version_manifest_v2,
            profiles::create_profile,
            profiles::delete_profile,
            profiles::update_profile,
            profiles::duplicate_profile,
            profiles::get_profiles,
            themes::get_themes,
            themes::refresh_themes,
            settings::get_setting,
            settings::set_setting
        ])
        .plugin(tauri_plugin_single_instance::init(|_, _, _|{}))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
