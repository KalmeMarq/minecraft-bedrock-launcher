use std::{path::PathBuf, fs::{File, self}};

use log::info;
use ::serde::{Serialize, Deserialize};
use tauri::State;

use crate::{utils::{LauncherSave, LauncherLoad}, LauncherState, CoreConfig};

pub fn get_launcher_settings_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("launcher_settings.json")
}
fn bool_true() -> bool {
    true
}

fn default_language() -> String {
    "en-US".to_string()
}

fn default_theme() -> String {
    "dark".to_string()
}

fn default_banner_theme() -> String {
    "latest".to_string()
}

fn default_ui_state() -> UIState {
    let pn_filter = PatchNotesFilter {
        releases: true,
        previews: false,
        betas: false
    };

    let conf_filter = ConfigurationFilter {
        releases: true,
        betas: true,
        previews: true,
        sort_by: SortBy::Name
    };

    let ui_state = UIState {
        configurations: conf_filter,
        patch_notes: pn_filter
    };

    ui_state
}

fn default_news_filter() -> NewsFilter {
    NewsFilter {
        java: true,
        bugrock: true,
        dungeons: true,
        legends: true
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PatchNotesFilter {
    #[serde(default = "bool_true")]
    releases: bool,
    #[serde(default = "bool_true")]
    betas: bool,
    #[serde(default = "bool_true")]
    previews: bool
}

impl PatchNotesFilter {
    pub fn set_releases(&mut self, value: bool) {
        self.releases = value;
    }

    pub fn set_betas(&mut self, value: bool) {
        self.betas = value;
    }

    pub fn set_previews(&mut self, value: bool) {
        self.previews = value;
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
enum SortBy {
    #[serde(rename = "name")]
    Name,
    #[serde(rename = "last-played")]
    LastPlayed
}

impl SortBy {
    fn as_str(&self) -> &'static str {
        match self {
            SortBy::Name => "name",
            SortBy::LastPlayed => "last-played"
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConfigurationFilter {
    #[serde(default = "bool_true")]
    releases: bool,
    #[serde(default = "bool_true")]
    betas: bool,
    #[serde(default = "bool_true")]
    previews: bool,
    #[serde(rename = "sortBy")]
    sort_by: SortBy
}

impl ConfigurationFilter {
    pub fn set_sort_by(&mut self, value: &str) {
        if value == "last-played" {
            self.sort_by = SortBy::LastPlayed;
        } else if value == "name" {
            self.sort_by = SortBy::Name;
        }
    }

    pub fn set_releases(&mut self, value: bool) {
        self.releases = value;
    }

    pub fn set_betas(&mut self, value: bool) {
        self.betas = value;
    }

    pub fn set_previews(&mut self, value: bool) {
        self.previews = value;
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct UIState {
    configurations: ConfigurationFilter,
    #[serde(rename = "patchNotes")]
    patch_notes: PatchNotesFilter
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NewsFilter {
    #[serde(default = "bool_true")]
    java: bool,
    #[serde(default = "bool_true")]
    bugrock: bool,
    #[serde(default = "bool_true")]
    dungeons: bool,
    #[serde(default = "bool_true")]
    legends: bool
}

impl NewsFilter {
    pub fn set_java(&mut self, value: bool) {
        self.java = value;
    }

    pub fn set_bugrock(&mut self, value: bool) {
        self.bugrock = value;
    }

    pub fn set_dungeons(&mut self, value: bool) {
        self.dungeons = value;
    }

    pub fn set_legends(&mut self, value: bool) {
        self.legends = value;
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LauncherSettings {
    #[serde(default = "bool_true")]
    keep_launcher_open: bool,
    #[serde(default = "default_banner_theme")]
    banner_theme: String,
    #[serde(default = "default_theme")]
    theme: String,
    #[serde(default = "default_language")]
    language: String,
    #[serde(default)]
    animate_pages: bool,
    #[serde(default = "default_ui_state")]
    bedrock: UIState,
    news_filter: NewsFilter
}

impl Default for LauncherSettings {
    fn default() -> Self {
        LauncherSettings {
            keep_launcher_open: true,
            banner_theme: default_banner_theme(),
            theme: default_theme(),
            language: default_language(),
            animate_pages: false,
            bedrock: default_ui_state(),
            news_filter: default_news_filter()
        }
    }
}

impl LauncherSettings {
    pub fn set_keep_launcher_open(&mut self, value: bool) {
        self.keep_launcher_open = value;
    }

    pub fn set_language(&mut self, value: &str) {
        if LANGUAGES.contains(&value) {
            self.language = value.to_string();
        }
    }

    pub fn set_banner_theme(&mut self, value: &str) {
        self.banner_theme = value.to_string();
    }

    pub fn set_theme(&mut self, value: &str) {
        self.theme = value.to_string();
    }

    pub fn set_animate_pages(&mut self, value: bool) {
        self.animate_pages = value;
    }
}

impl LauncherSave for LauncherSettings {
    fn save(&self, _app_handle: &tauri::AppHandle, core_config: &CoreConfig) {
        info!("Saving launcher settings");

        serde_json::to_writer_pretty(
            &File::create(get_launcher_settings_path(&core_config.launcher_path)).expect("Could not save launcher settings file"), 
            self
        ).expect("Could not save launcher settings");
    }
}

impl LauncherLoad<LauncherSettings> for LauncherSettings {
    fn load(app_handle: &tauri::AppHandle, core_config: &CoreConfig) -> LauncherSettings {
        info!("Loading launcher settings");

        let settings_path = get_launcher_settings_path(&core_config.launcher_path);

        let mut settings: LauncherSettings = LauncherSettings::default();

        if settings_path.exists() {
            let data = fs::read_to_string(settings_path).expect("Could not read launcher settings");
            settings = serde_json::from_str(&data).expect("Could not load launcher settings");
        } else {
            settings.save(app_handle, core_config);
        }

        settings
    }
}

fn parse_set_bool(val: &str) -> bool {
    match val {
        "true" => true,
        "false" => false,
        _ => false,
    }
}

static LANGUAGES: [&str; 6] = ["en-US", "en-GB", "pt-PT", "pt-BR", "es-ES", "es-MX"];

#[tauri::command]
pub fn set_setting(state: State<LauncherState>, option: &str, value: &str) {
    info!("Option '{}' set to '{}'", option, value);

    match option {
        "keepLauncherOpen" => state.settings.lock().unwrap().set_keep_launcher_open(parse_set_bool(value)),
        "bannerTheme" => state.settings.lock().unwrap().set_banner_theme(value),
        "theme" => state.settings.lock().unwrap().set_theme(value),
        "language" => state.settings.lock().unwrap().set_language(value),
        "animatePages" => state.settings.lock().unwrap().set_animate_pages(parse_set_bool(value)),
        "bedrock:configurations/sortBy" => state.settings.lock().unwrap().bedrock.configurations.set_sort_by(value),
        "bedrock:configurations/releases" => state.settings.lock().unwrap().bedrock.configurations.set_releases(parse_set_bool(value)),
        "bedrock:configurations/betas" => state.settings.lock().unwrap().bedrock.configurations.set_betas(parse_set_bool(value)),
        "bedrock:configurations/previews" => state.settings.lock().unwrap().bedrock.configurations.set_previews(parse_set_bool(value)),
        "bedrock:patchNotes/betas" => state.settings.lock().unwrap().bedrock.patch_notes.set_betas(parse_set_bool(value)),
        "bedrock:patchNotes/releases" => state.settings.lock().unwrap().bedrock.patch_notes.set_releases(parse_set_bool(value)),
        "bedrock:patchNotes/previews" => state.settings.lock().unwrap().bedrock.patch_notes.set_previews(parse_set_bool(value)),
        "news:java" => state.settings.lock().unwrap().news_filter.set_java(parse_set_bool(value)),
        "news:bugrock" => state.settings.lock().unwrap().news_filter.set_bugrock(parse_set_bool(value)),
        "news:dungeons" => state.settings.lock().unwrap().news_filter.set_dungeons(parse_set_bool(value)),
        "news:legends" => state.settings.lock().unwrap().news_filter.set_legends(parse_set_bool(value)),
        _ => {}
    }
}

#[tauri::command]
pub fn get_setting(state: State<LauncherState>, option: &str) -> String {
   match option {
       "keepLauncherOpen" => state.settings.lock().unwrap().keep_launcher_open.to_string(),
       "bannerTheme" => state.settings.lock().unwrap().banner_theme.clone(),
       "theme" => state.settings.lock().unwrap().theme.clone(),
       "language" => state.settings.lock().unwrap().language.clone(),
       "animatePages" => state.settings.lock().unwrap().animate_pages.to_string(),
       "bedrock:configurations/sortBy" => state.settings.lock().unwrap().bedrock.configurations.sort_by.as_str().to_string(),
       "bedrock:configurations/releases" => state.settings.lock().unwrap().bedrock.configurations.releases.to_string(),
       "bedrock:configurations/betas" => state.settings.lock().unwrap().bedrock.configurations.betas.to_string(),
       "bedrock:configurations/previews" => state.settings.lock().unwrap().bedrock.configurations.previews.to_string(),
       "bedrock:patchNotes/releases" => state.settings.lock().unwrap().bedrock.patch_notes.releases.to_string(),
       "bedrock:patchNotes/betas" => state.settings.lock().unwrap().bedrock.patch_notes.betas.to_string(),
       "bedrock:patchNotes/previews" => state.settings.lock().unwrap().bedrock.patch_notes.previews.to_string(),
       "news:java" => state.settings.lock().unwrap().news_filter.java.to_string(),
       "news:bugrock" => state.settings.lock().unwrap().news_filter.bugrock.to_string(),
       "news:dungeons" => state.settings.lock().unwrap().news_filter.dungeons.to_string(),
       "news:legends" => state.settings.lock().unwrap().news_filter.legends.to_string(),
       _ => "unknown".to_string()
   } 
}

// pub fn load_settings() -> LauncherSettings {
//     info!("Loading launcher settings");

//     let settings_path = get_launcher_settings_path();

//     let mut settings: LauncherSettings = LauncherSettings::default();

//     if settings_path.exists() {
//         let data = fs::read_to_string(settings_path).expect("Could not read launcher settings");
//         settings = serde_json::from_str(&data).expect("Could not load launcher settings");
//     } else {
//         settings.save();
//     }

//     settings
// }