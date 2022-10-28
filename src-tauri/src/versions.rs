use std::{collections::HashMap, sync::Mutex};

use crate::{utils::{get_version_manifest_v2, get_versions_path}, CoreConfig};
use chrono::{Duration, Utc, SecondsFormat};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tauri::regex::Regex;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Latest {
    release: String,
    beta: String,
    preview: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Version {
    id: String,
    #[serde(rename = "releaseTime")]
    release_time: String,
    #[serde(rename = "type")]
    version_type: String,
    #[serde(rename = "serverId")]
    server_id: String,
    version: String,
    uuid: HashMap<String, String>
}

impl Version {
    pub fn get_uuid(&self, arch: String) -> Option<String> {
        if self.uuid.contains_key(&arch) {
            Some(self.uuid.get(&arch).unwrap().clone())
        } else {
            None
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VersionManifestV2 {
    #[serde(alias = "lastest")]
    latest: Latest,
    versions: Vec<Version>
}

impl VersionManifestV2 {
    pub fn get_version_by_id(&self, id: String) -> Option<&Version> {
        self.versions.iter().find(|v| v.id == id)
    }

    pub fn get_version_uuid(&self, id: String, arch: String) -> Option<String> {
        if let Some(ver) = self.get_version_by_id(id) {
            ver.get_uuid(arch)
        } else {
            None
        }
    }
}

#[derive(Serialize, Debug, Clone)]
pub struct VersionInfo {
    id: String,
    path: String,
    size: u64
}

#[tauri::command]
pub async fn get_local_versions(state: tauri::State<'_, Mutex<CoreConfig>>) -> Result<Vec<VersionInfo>, ()> {
    let ver_path = get_versions_path(&state.lock().unwrap().launcher_path);

    let vm_v2: VersionManifestV2 = serde_json::from_value(get_version_manifest_v2(state).await.unwrap()).unwrap();

    let mut vers: Vec<VersionInfo> = Vec::new();

    for version in vm_v2.versions.iter() {
        for (_, uuid) in version.uuid.iter() {
            let path = ver_path.join(vec![version.id.clone(), uuid.to_string()].join("-"));

            if path.exists() {
                let size = fs_extra::dir::get_size(&path).unwrap();
                vers.push(VersionInfo { id: version.id.clone(), path: path.to_str().unwrap().to_string(), size })
            }
        }
    }

    Ok(vers)
}

static DEFAULT_URL: &str = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx";
static SECURED_URL: &str = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured";

static SOAP: &str = "http://www.w3.org/2003/05/soap-envelope";
static ADDRESSING: &str = "http://www.w3.org/2005/08/addressing";
static SECEXT: &str = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
static SECUTIL: &str = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";
static WUWS: &str = "http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization";
static WUCLIENT: &str = "http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService";

pub async fn get_version_download_link(update_identity: String, revision_number: u32) -> Result<String, ()> {
    let dt_now = Utc::now();
    let dt_now_plus_five = dt_now + Duration::minutes(5);
    
    let body = format!("
    <s:Envelope xmlns:a=\"{addressing}\" xmlns:s=\"{soap}\">
    
        <s:Header>
            <a:Action s:mustUnderstand=\"1\">{wuclient}/GetExtendedUpdateInfo2</a:Action>
            <a:MessageID>urn:uuid:5754a03d-d8d5-489f-b24d-efc31b3fd32d</a:MessageID>
            <a:To s:mustUnderstand=\"1\">{secureurl}</a:To>

            <o:Security s:mustUnderstand=\"1\" xmlns:o=\"{secext}\">
            <Timestamp xmlns=\"{secutil}\">
                <Created>{now}</Created>
                <Expires>{nowplusfive}</Expires>
            </Timestamp>
            <wuws:WindowsUpdateTicketsToken wsu:id=\"ClientMSA\" xmlns:wsu=\"{secutil}\" xmlns:wuws=\"{wuws}\">
                <TicketType Name=\"AAD\" Version=\"1.0\" Policy=\"MBI_SSL\"></TicketType>
            </wuws:WindowsUpdateTicketsToken>
            </o:Security>
        </s:Header>

        <s:Body>
            <GetExtendedUpdateInfo2 xmlns=\"{wuclient}\">
            <updateIDs>
                <UpdateIdentity>
                <UpdateID>{updateidentity}</UpdateID>
                <RevisionNumber>{revisionnumber}</RevisionNumber>
                </UpdateIdentity>
            </updateIDs>
            <infoTypes>
                <XmlUpdateFragmentType>FileUrl</XmlUpdateFragmentType>
                <XmlUpdateFragmentType>FileDecryption</XmlUpdateFragmentType>
                <XmlUpdateFragmentType>EsrpDecryptionInformation</XmlUpdateFragmentType>
                <XmlUpdateFragmentType>PiecesHashUrl</XmlUpdateFragmentType>
                <XmlUpdateFragmentType>BlockMapUrl</XmlUpdateFragmentType>
            </infoTypes>
            <deviceAttributes>E:BranchReadinessLevel=CBB&amp;DchuNvidiaGrfxExists=1&amp;ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&amp;CurrentBranch=rs4_release&amp;DataVer_RS5=1942&amp;FlightRing=Retail&amp;AttrDataVer=57&amp;InstallLanguage=en-US&amp;DchuAmdGrfxExists=1&amp;OSUILocale=en-US&amp;InstallationType=Client&amp;FlightingBranchName=&amp;Version_RS5=10&amp;UpgEx_RS5=Green&amp;GStatus_RS5=2&amp;OSSkuId=48&amp;App=WU&amp;InstallDate=1529700913&amp;ProcessorManufacturer=GenuineIntel&amp;AppVer=10.0.17134.471&amp;OSArchitecture=AMD64&amp;UpdateManagementGroup=2&amp;IsDeviceRetailDemo=0&amp;HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&amp;IsFlightingEnabled=0&amp;DchuIntelGrfxExists=1&amp;TelemetryLevel=1&amp;DefaultUserRegion=244&amp;DeferFeatureUpdatePeriodInDays=365&amp;Bios=Unknown&amp;WuClientVer=10.0.17134.471&amp;PausedFeatureStatus=1&amp;Steam=URL%3Asteam%20protocol&amp;Free=8to16&amp;OSVersion=10.0.17134.472&amp;DeviceFamily=Windows.Desktop</deviceAttributes>
            </GetExtendedUpdateInfo2>
        </s:Body>

    </s:Envelope>
    ", now = dt_now.to_rfc3339_opts(SecondsFormat::Millis, true), nowplusfive = dt_now_plus_five.to_rfc3339_opts(SecondsFormat::Millis, true), addressing = ADDRESSING, soap = SOAP, wuclient = WUCLIENT, secureurl = SECURED_URL, secext = SECEXT, secutil = SECUTIL, wuws = WUWS, updateidentity = update_identity, revisionnumber = revision_number);

    let client = reqwest::ClientBuilder::new().danger_accept_invalid_certs(true).build().unwrap();

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(reqwest::header::CONTENT_TYPE, "application/soap+xml; charset=utf-8".parse().unwrap());
    headers.insert(reqwest::header::USER_AGENT, "Windows-Update-Agent/10.0.10011.16384 Client-Protocol/1.81".parse().unwrap());

    let res = client
        .post(SECURED_URL)
        .headers(headers)
        .body(body)
        .send()
        .await.ok();

    let reg = Regex::new(r"http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/[a-zA-Z0-9-?=&;%]+").unwrap();

    if let Some(response) = res {
        if response.status() == StatusCode::OK {
            let txt = response.text().await;

            if let Ok(data) = txt {
                if let Some(url) = reg.find(&data) {
                    let link = url.as_str().to_string().replace("&amp;", "&");

                    return Ok(link);
                }
            }
        }
    }

    Err(())
}