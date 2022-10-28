use std::{path::PathBuf, fs::{self, File, read_to_string}, process::Command, io::Write, sync::Mutex, env::temp_dir};

use log::info;
use log4rs::config::RawConfig;
use reqwest::StatusCode;
use tauri::{regex::Regex, api::{dialog::blocking::FileDialogBuilder, dir::with_temp_dir}};

use crate::CoreConfig;

pub fn get_cache_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("webcache")
}

pub fn get_versions_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("versions")
}

pub fn get_installations_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("installations")
}

pub fn get_themes_path(launcher_path: &PathBuf) -> PathBuf {
    launcher_path.join("themes")
}

pub fn get_temp_path() -> PathBuf {
    let path = temp_dir().join("minicraft_launcher");

    if !path.exists() {
        fs::create_dir(&path).expect("Could not create temp directory");
    }

    path
}

pub fn create_launcher_dirs(launcher_path: &PathBuf) {
    info!("Creating launcher dirs");

    if !launcher_path.exists() {
        fs::create_dir(launcher_path).expect("Could not create launcher directory");
    }
    
    if !get_versions_path(launcher_path).exists() {
        fs::create_dir(get_versions_path(launcher_path)).expect("Could not create versions directory");
    }

    if !get_installations_path(launcher_path).exists() {
        fs::create_dir(get_installations_path(launcher_path)).expect("Could not create installations directory");
    }

    if !get_themes_path(launcher_path).exists() {
        fs::create_dir(get_themes_path(launcher_path)).expect("Could not create themes directory");
    }
}

pub fn init_logger(app: tauri::AppHandle, core_config: &CoreConfig) {
    info!("Initializing logger");

    let log_config_path = app.path_resolver().resolve_resource("resources/log4rs.yml").expect("failed to resolve log4rs.yml resource");

    let binding = core_config.launcher_path.join("launcher_log.txt");
    
    let log_file_path = binding.to_str().unwrap().replace("\\", "/");
    let log_config_str = read_to_string(&log_config_path).unwrap();

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
    fn save(&self, app_handle: &tauri::AppHandle, core_config: &CoreConfig);
}

pub trait LauncherLoad<T> {
    fn load(app_handle: &tauri::AppHandle, core_config: &CoreConfig) -> T; 
}

#[tauri::command]
pub fn pick_folder(default_folder: String) -> Result<String, ()> {
    let dialog = FileDialogBuilder::new().set_directory(PathBuf::from(default_folder));
    let dir_path = dialog.pick_folder();

    match dir_path {
        Some(value) => Ok(value.to_str().unwrap().to_string()),
        None => Ok("".into())
    }
}

#[tauri::command]
pub async fn get_news_minecraft(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<serde_json::Value, ()> {
    let pn_path = get_cache_path(&state.lock().unwrap().launcher_path).join("ndo");
    let data = get_json_cached_file(pn_path, "https://launchercontent.mojang.com/news.json", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_news_minecraft_forum(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<String, ()> {
    let pn_path = get_cache_path(&state.lock().unwrap().launcher_path).join("ndgo");
    let data = get_text_cached_file(pn_path, "https://www.minecraftforum.net/news.rss", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_news_minecraft_top(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<String, ()> {
    let pn_path = get_cache_path(&state.lock().unwrap().launcher_path).join("nduo");
    let data = get_text_cached_file(pn_path, "https://minecrafttop.com/news/rss", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_launcher_patch_notes(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<serde_json::Value, ()> {
    let pn_path = get_cache_path(&state.lock().unwrap().launcher_path).join("mqo");
    let data = get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/patchnotes/launcherPatchNotes.json", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_bedrock_patch_notes(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<serde_json::Value, ()> {
    let pn_path = get_cache_path(&state.lock().unwrap().launcher_path).join("nqro");
    let data = get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/patchnotes/bedrockPatchNotes.json", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_version_manifest(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<serde_json::Value, ()> {
    let pn_path = get_versions_path(&state.lock().unwrap().launcher_path).join("version_manifest.json");
    let data = get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/version_manifest.json", 60).await;
    Ok(data)
}

#[tauri::command]
pub async fn get_version_manifest_v2(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<serde_json::Value, ()> {
    let pn_path = get_versions_path(&state.lock().unwrap().launcher_path).join("version_manifest_v2.json");
    let data = get_json_cached_file(pn_path, "https://github.com/KalmeMarq/minecraft-bedrock-launcher-content/raw/master/version_manifest_v2.json", 60).await;
    Ok(data)
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

pub async fn get_json_from_url_if_modified(request_url: &str) -> Option<serde_json::Value> {
    let client = reqwest::Client::new();
    let reg = Regex::new(r"\+\d{4}").unwrap();

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(reqwest::header::IF_MODIFIED_SINCE, reg.replace_all(&chrono::Utc::now().to_rfc2822().to_string(), "GMT").parse().unwrap());
    headers.insert(reqwest::header::EXPIRES, "-1".parse().unwrap());
    headers.insert(reqwest::header::CACHE_CONTROL, "must-revalidate, private".parse().unwrap());
   
    let res = client
        .get(request_url)
        .headers(headers)
        .send().await.ok();

    if let Some(response) = res {
        if response.status() == StatusCode::NOT_MODIFIED {
            None
        } else if response.status() == StatusCode::OK {
            Some(serde_json::from_str(&response.text().await.expect("Could not get text file")).expect("Could not parse json"))
        } else {
            None
        }
    } else {
        None
    }    
}

pub async fn get_text_from_url_if_modified(request_url: &str) -> Option<String> {
    let client = reqwest::Client::new();
    let reg = Regex::new(r"\+\d{4}").unwrap();

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(reqwest::header::IF_MODIFIED_SINCE, reg.replace_all(&chrono::Utc::now().to_rfc2822().to_string(), "GMT").parse().unwrap());
    headers.insert(reqwest::header::EXPIRES, "-1".parse().unwrap());
    headers.insert(reqwest::header::CACHE_CONTROL, "must-revalidate, private".parse().unwrap());
   
    let res = client
        .get(request_url)
        .headers(headers)
        .send().await.ok();

    if let Some(response) = res {
        if response.status() == StatusCode::NOT_MODIFIED {
            None
        } else if response.status() == StatusCode::OK {
            Some(response.text().await.expect("Could not get text file"))
        } else {
            None
        }
    } else {
        None
    }    
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

pub async fn get_json_cached_file(file_path: PathBuf, request_url: &str, minutes_to_wait: u64) -> serde_json::Value {
    if file_path.exists() {
        let metadata = std::fs::metadata(&file_path)
            .expect("Could not read metadata for cache file");

        let dur = metadata.modified().unwrap().elapsed().unwrap();

        if dur.as_secs() / 60 > minutes_to_wait {
            let data = get_json_from_url_if_modified(request_url).await;
            
            if let Some(d) = data {
                save_json_to_file(file_path, &d);
                d
            } else {
                let data = fs::read_to_string(&file_path).expect("Could not read cached file");
                let json: serde_json::Value =
                    serde_json::from_str(&data).expect("Could not jsonify file");
                json
            }
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

pub async fn get_text_cached_file(file_path: PathBuf, request_url: &str, minutes_to_wait: u64) -> String {
    if file_path.exists() {
        let metadata = std::fs::metadata(&file_path)
            .expect("Could not read metadata for cache file");

        let dur = metadata.modified().unwrap().elapsed().unwrap();

        if dur.as_secs() / 60 > minutes_to_wait {
            let data = get_text_from_url_if_modified(request_url).await;
            
            if let Some(d) = data {
                save_text_to_file(file_path, &d);
                d
            } else {
                let data = fs::read_to_string(&file_path).expect("Could not read cached file");
                data
            }
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