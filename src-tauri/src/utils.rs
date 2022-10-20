use std::{path::PathBuf, fs::{self, File}, process::Command, io::Write};

use log::info;
use log4rs::config::RawConfig;
use tauri::regex::Regex;

pub fn get_launcher_path() -> PathBuf {
    dirs::data_dir().unwrap().join(".minicraft_bedrock_launcher")
}

pub fn get_cache_path() -> PathBuf {
    get_launcher_path().join("webcache")
}

pub fn get_versions_path() -> PathBuf {
    get_launcher_path().join("versions")
}

pub fn get_installations_path() -> PathBuf {
    get_launcher_path().join("installations")
}

pub fn get_themes_path() -> PathBuf {
    get_launcher_path().join("themes")
}

pub fn create_launcher_dirs() {
    if !get_launcher_path().exists() {
        fs::create_dir(get_launcher_path()).expect("Could not create launcher directory");
    }
    
    if !get_versions_path().exists() {
        fs::create_dir(get_versions_path()).expect("Could not create versions directory");
    }

    if !get_installations_path().exists() {
        fs::create_dir(get_installations_path()).expect("Could not create installations directory");
    }

    if !get_themes_path().exists() {
        fs::create_dir(get_themes_path()).expect("Could not create themes directory");
    }
}

pub fn init_logger(app: tauri::AppHandle) {
    info!("Initializing logger");

    let log_config_path = app.path_resolver().resolve_resource("resources/log4rs.yml").expect("failed to resolve log4rs.yml resource");

    let binding = get_launcher_path().join("launcher_log.txt");
    
    let log_file_path = binding.to_str().unwrap().replace("\\", "/");
    let log_config_str = fs::read_to_string(&log_config_path).unwrap();

    let re = Regex::new(r"%LOG_FILE_PATH%").unwrap();
    let log_config = re.replace_all(&log_config_str, log_file_path);

    let raw_config = serde_yaml::from_str::<RawConfig>(&log_config).unwrap();
    let _handle = log4rs::init_raw_config(raw_config).unwrap();
}

pub fn open_folder(path: PathBuf) {
    #[cfg(target_os = "windows")]
    Command::new("explorer").arg("/select,".to_owned() + path.to_str().unwrap()).spawn().unwrap();

    #[cfg(target_os = "macos")]
    Command::new("open").args(["-R", &path.to_str().unwrap()]).spawn().unwrap();

    #[cfg(target_os = "linux")]
    Command::new("xdg-open").arg(&path.to_str().unwrap()).spawn().unwrap(); 
}

pub trait LauncherSave {
    fn save(&self);
}

#[tauri::command]
pub async fn get_news_minecraft() -> serde_json::Value {
    get_json_cached_file(get_cache_path().join("ndo"), "https://launchercontent.mojang.com/news.json", 60).await
}

#[tauri::command]
pub async fn get_news_minecraft_forum() -> String {
    get_text_cached_file(get_cache_path().join("ndgo"), "https://www.minecraftforum.net/news.rss", 60).await
}

#[tauri::command]
pub async fn get_news_minecraft_top() -> String {
    get_text_cached_file(get_cache_path().join("nduo"), "https://minecrafttop.com/news/rss", 60).await
}

#[tauri::command]
pub async fn get_launcher_patch_notes() -> serde_json::Value {
    get_json_cached_file(get_cache_path().join("mqo"), "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/patchnotes/launcherPatchNotes.json", 60).await
}

#[tauri::command]
pub async fn get_bedrock_patch_notes() -> serde_json::Value {
    let pn_path = get_cache_path().join("nqro");
    get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/patchnotes/bedrockPatchNotes.json", 60).await
}

#[tauri::command]
pub async fn get_version_manifest() -> serde_json::Value {
    let pn_path = get_versions_path().join("version_manifest.json");
    get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/version_manifest.json", 60).await
}

#[tauri::command]
pub async fn get_version_manifest_v2() -> serde_json::Value {
    let pn_path = get_versions_path().join("version_manifest_v2.json");
    get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/version_manifest_v2.json", 60).await
}

pub async fn get_json_from_url(request_url: &str) -> serde_json::Value {
    let data = reqwest::get(request_url.to_string())
        .await
        .expect("Could not get file from url")
        .text()
        .await
        .expect("Could not jsonify file");

    serde_json::from_str(&data).expect("Could not parse json")
}

pub async fn get_text_from_url(request_url: &str) -> String {
    let data = reqwest::get(request_url.to_string())
        .await
        .expect("Could not get file from url")
        .text()
        .await
        .expect("Could not get file");

    data
}

pub fn save_json_to_file(file_path: PathBuf, data: &serde_json::Value) {
    serde_json::to_writer_pretty(
        &File::create(&file_path).expect("Could not create file"),
        data,
    )
    .expect("Could not save json to file");
}

pub fn save_text_to_file(file_path: PathBuf, data: &String) {
    let mut file = File::create(&file_path).unwrap();
    file.write(&data.as_bytes()).unwrap();
    file.flush().unwrap();
}

// TODO: Instead of checking every given minutes, use If-Modified-Since header. It doesn't wastes the rate limit. If not modified then used the stored file
pub async fn get_json_cached_file(file_path: PathBuf, request_url: &str, minutes_to_wait: u64) -> serde_json::Value {
    if file_path.exists() {
        let metadata = std::fs::metadata(&file_path)
            .expect("Could not read metadata for cache file");

        let dur = metadata.modified().unwrap().elapsed().unwrap();

        if dur.as_secs() / 60 > minutes_to_wait {
            let data = get_json_from_url(request_url).await;
            save_json_to_file(file_path, &data);

            data
        } else {
            let data = fs::read_to_string(&file_path).expect("Could not read cached file");
            let json: serde_json::Value =
                serde_json::from_str(&data).expect("Could not jsonify file");
            json
        }
    } else {
        let data = get_json_from_url(request_url).await;
        save_json_to_file(file_path, &data);

        data
    }
}

// TODO: Instead of checking every given minutes, use If-Modified-Since header. It doesn't wastes the rate limit. If not modified then used the stored file
pub async fn get_text_cached_file(file_path: PathBuf, request_url: &str, minutes_to_wait: u64) -> String {
    if file_path.exists() {
        let metadata = std::fs::metadata(&file_path)
            .expect("Could not read metadata for cache file");

        let dur = metadata.modified().unwrap().elapsed().unwrap();

        if dur.as_secs() / 60 > minutes_to_wait {
            let data = get_text_from_url(request_url).await;
            save_text_to_file(file_path, &data);
         
            data
        } else {
            let data = fs::read_to_string(&file_path).expect("Could not read cached file");
            data
        }
    } else {
        let data = get_text_from_url(request_url).await;
        save_text_to_file(file_path, &data);

        data
    }
}