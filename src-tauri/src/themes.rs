use std::{collections::HashMap, fs, sync::Mutex};

use log::{info, warn};
use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::{LauncherState, utils::{get_themes_path, LauncherLoad}, CoreConfig};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum ThemeType {
    Dark,
    Light
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Theme {
    #[serde(rename = "type")]
    theme_type: ThemeType,
    pub name: String,
    styles: HashMap<String, String>
}

pub struct LauncherThemes {
    pub themes: Vec<Theme>
}

impl LauncherThemes {
    fn push(&mut self, theme: Theme) {
        self.themes.push(theme);
    }
}

#[tauri::command]
pub fn get_themes(state: tauri::State<LauncherState>) -> Vec<Theme> {
    state.themes.lock().unwrap().themes.clone()
}

#[tauri::command]
pub fn refresh_themes(app_handle: tauri::AppHandle, state: tauri::State<LauncherState>) -> Result<(), ()> {
    info!("Refreshing themes");

    let mut themes: Vec<Theme> = Vec::new();

    let paths = fs::read_dir(get_themes_path(&app_handle.state::<Mutex<CoreConfig>>().lock().unwrap().launcher_path)).unwrap();

    for path in paths {
        let file_path = path.unwrap().path();
        
        if file_path.extension().unwrap() == "json" {
            let data: String = fs::read_to_string(&file_path).unwrap().parse().unwrap();
            let theme: Theme = serde_json::from_str(&data).unwrap();

            if !themes.iter().position(|t| t.name == theme.name).is_some() {
                themes.push(theme);
            }
        }
    }

    state.themes.lock().unwrap().themes.clear();
    state.themes.lock().unwrap().themes = themes;

    Ok(())
}

impl LauncherLoad<LauncherThemes> for LauncherThemes {
    fn load(_app_handle: &tauri::AppHandle, core_config: &CoreConfig) -> LauncherThemes {
        info!("Loading launcher themes");

        let paths = fs::read_dir(get_themes_path(&core_config.launcher_path)).unwrap();

        let mut themes = LauncherThemes { themes: Vec::new() };
    
        // themes.push(default_dark_theme(&app_handle));
        // themes.push(default_light_theme(&app_handle));
    
        for path in paths {
            let file_path = path.unwrap().path();
            
            if file_path.extension().unwrap() == "json" {
                let data: String = fs::read_to_string(&file_path).unwrap().parse().unwrap();
                let theme: Theme = serde_json::from_str(&data).unwrap();
    
                info!("Found theme: type={:?} name={}", theme.theme_type, theme.name);
    
                if !themes.themes.iter().position(|t| t.name == theme.name).is_some() {
                    themes.push(theme);
                } else {
                    warn!("Theme {} already exists", theme.name);
                }
            }
        }
    
        themes
    }
}

// pub fn load_themes() -> LauncherThemes {
//     info!("Loading launcher themes");

//     // let default_dark_theme_path = get_themes_path().join("default_dark.json");
//     // let default_light_theme_path = get_themes_path().join("default_light.json");

//     // serde_json::to_writer_pretty(
//     //     &File::create(default_dark_theme_path).expect("Could not save dark theme file"), 
//     //     &default_dark_theme()
//     // ).expect("Could not save dark theme");

//     // serde_json::to_writer_pretty(
//     //     &File::create(default_light_theme_path).expect("Could not save light theme file"), 
//     //     &default_light_theme()
//     // ).expect("Could not save light theme");

//     let paths = fs::read_dir(get_themes_path()).unwrap();

//     let mut themes = LauncherThemes { themes: Vec::new() };

//     for path in paths {
//         let file_path = path.unwrap().path();
        
//         if file_path.extension().unwrap() == "json" {
//             let data: String = fs::read_to_string(&file_path).unwrap().parse().unwrap();
//             let theme: Theme = serde_json::from_str(&data).unwrap();

//             info!("Found theme: type={:?} name={}", theme.theme_type, theme.name);

//             if !themes.themes.iter().position(|t| t.name == theme.name).is_some() {
//                 themes.push(theme);
//             } else {
//                 warn!("Theme {} already exists", theme.name);
//             }
//         }
//     }

//     themes
// }