use std::{path::PathBuf, fs::{File, self}};

use log::info;
use ::serde::{Serialize, Deserialize};
use tauri::State;

use crate::{utils::{get_launcher_path, LauncherSave}, LauncherState};

pub fn get_launcher_settings_path() -> PathBuf {
    get_launcher_path().join("launcher_settings.json")
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

fn default_ui_state() -> UIState {
    let pn_filter = PatchNotesFilter {
        releases: true,
        betas: false
    };

    let conf_filter = ConfigurationFilter {
        releases: true,
        betas: true,
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
    betas: bool
}

impl PatchNotesFilter {
    pub fn set_releases(&mut self, value: bool) {
        self.releases = value;
    }

    pub fn set_betas(&mut self, value: bool) {
        self.betas = value;
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
    #[serde(default = "default_theme")]
    theme: String,
    #[serde(default = "default_language")]
    language: String,
    #[serde(default)]
    open_output_log: bool,
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
            theme: default_theme(),
            language: default_language(),
            open_output_log: false,
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

    pub fn set_theme(&mut self, value: &str) {
        self.theme = value.to_string();
    }

    pub fn set_animate_pages(&mut self, value: bool) {
        self.animate_pages = value;
    }

    pub fn set_open_output_log(&mut self, value: bool) {
        self.open_output_log = value;
    }
}

impl LauncherSave for LauncherSettings {
    fn save(&self) {
        serde_json::to_writer_pretty(
            &File::create(get_launcher_settings_path()).expect("Could not save launcher settings file"), 
            self
        ).expect("Could not save launcher settings");
    }
}

fn parse_set_bool(val: &str) -> bool {
    match val {
        "true" => true,
        "false" => false,
        _ => false,
    }
}

static LANGUAGES: [&str; 4] = ["en-US", "en-GB", "pt-PT", "pt-BR"];

#[tauri::command]
pub fn set_setting(state: State<LauncherState>, option: &str, value: &str) {
    info!("Option '{}' set to '{}'", option, value);

    match option {
        "keepLauncherOpen" => state.settings.lock().unwrap().set_keep_launcher_open(parse_set_bool(value)),
        "theme" => state.settings.lock().unwrap().set_theme(value),
        "language" => state.settings.lock().unwrap().set_language(value),
        "animatePages" => state.settings.lock().unwrap().set_animate_pages(parse_set_bool(value)),
        "openOutputLog" => state.settings.lock().unwrap().set_open_output_log(parse_set_bool(value)),
        "bedrock:configurations/sortBy" => state.settings.lock().unwrap().bedrock.configurations.set_sort_by(value),
        "bedrock:configurations/releases" => state.settings.lock().unwrap().bedrock.configurations.set_releases(parse_set_bool(value)),
        "bedrock:configurations/betas" => state.settings.lock().unwrap().bedrock.configurations.set_betas(parse_set_bool(value)),
        "bedrock:patchNotes/betas" => state.settings.lock().unwrap().bedrock.patch_notes.set_betas(parse_set_bool(value)),
        "bedrock:patchNotes/releases" => state.settings.lock().unwrap().bedrock.patch_notes.set_releases(parse_set_bool(value)),
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
       "theme" => state.settings.lock().unwrap().theme.clone(),
       "language" => state.settings.lock().unwrap().language.clone(),
       "animatePages" => state.settings.lock().unwrap().animate_pages.to_string(),
       "openOutputLog" => state.settings.lock().unwrap().open_output_log.to_string(),
       "bedrock:configurations/sortBy" => state.settings.lock().unwrap().bedrock.configurations.sort_by.as_str().to_string(),
       "bedrock:configurations/releases" => state.settings.lock().unwrap().bedrock.configurations.releases.to_string(),
       "bedrock:configurations/betas" => state.settings.lock().unwrap().bedrock.configurations.betas.to_string(),
       "bedrock:patchNotes/releases" => state.settings.lock().unwrap().bedrock.patch_notes.releases.to_string(),
       "bedrock:patchNotes/betas" => state.settings.lock().unwrap().bedrock.patch_notes.betas.to_string(),
       "news:java" => state.settings.lock().unwrap().news_filter.java.to_string(),
       "news:bugrock" => state.settings.lock().unwrap().news_filter.bugrock.to_string(),
       "news:dungeons" => state.settings.lock().unwrap().news_filter.dungeons.to_string(),
       "news:legends" => state.settings.lock().unwrap().news_filter.legends.to_string(),
       _ => "unknown".to_string()
   } 
}

pub fn load_settings() -> LauncherSettings {
    info!("Loading launcher settings");

    let settings_path = get_launcher_settings_path();

    let mut settings: LauncherSettings = LauncherSettings::default();

    if settings_path.exists() {
        let data = fs::read_to_string(settings_path).expect("Could not read launcher settings");
        settings = serde_json::from_str(&data).expect("Could not load launcher settings");
    } else {
        settings.save();
    }

    settings
}