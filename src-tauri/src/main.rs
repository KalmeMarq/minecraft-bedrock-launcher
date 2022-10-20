#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod utils;
pub mod profiles;
pub mod settings;
pub mod themes;

use std::sync::Mutex;

use log::info;
use profiles::LauncherProfiles;
use settings::{LauncherSettings, load_settings};
use tauri::{WindowBuilder, WindowUrl, AppHandle, Manager};
use themes::LauncherThemes;
use utils::{create_launcher_dirs, get_cache_path, LauncherSave};

use crate::{settings::{get_setting, set_setting}, utils::init_logger, themes::{load_themes, get_themes, refresh_themes}, profiles::{load_profiles, get_profiles}};

#[allow(dead_code)]
pub struct LauncherState {
    pub settings: Mutex<LauncherSettings>,
    pub profiles: Mutex<LauncherProfiles>,
    pub themes: Mutex<LauncherThemes>,
    app_handle: AppHandle
}

impl LauncherState {
    fn save(&self) {
        self.settings.lock().unwrap().save();
        self.profiles.lock().unwrap().save();
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

#[tokio::main]
async fn main() {
    create_launcher_dirs();

    tauri::Builder::default()
        .setup(|app| {
            init_logger(app.app_handle());

            info!("Creating core window");
            
            let main_win = WindowBuilder::new(app, "core", WindowUrl::App("index.html".into()))
                .data_directory(get_cache_path())
                .inner_size(1000.0, 600.0)
                .min_inner_size(1000.0, 600.0)
                .title("Minecraft Bedrock Launcher")
                .visible(false)
                .build()?;

            let settings = load_settings();
            let profiles = load_profiles();
            let themes = load_themes();

            main_win.manage(LauncherState {
                settings: Mutex::from(settings),
                profiles: Mutex::from(profiles),
                themes: Mutex::from(themes),
                app_handle: app.app_handle()
            });

            info!("Window creation finished");

            main_win.show().unwrap();

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Destroyed => {
                if event.window().label() == "core" {
                    event.window().app_handle().state::<LauncherState>().save();
                }
            }
            _ => {}
          })
        .invoke_handler(tauri::generate_handler![
            test_stuff,
            
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
            get_profiles,
            get_themes,
            refresh_themes,
            get_setting,
            set_setting
        ])
        .plugin(tauri_plugin_single_instance::init(|_, _, _|{}))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
