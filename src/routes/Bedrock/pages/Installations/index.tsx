import { useContext, useEffect, useRef, useState } from 'react';
import ErrorPopup from './components/ErrorPopup';
import Checkbox from '../../../../components/Checkbox';
import SearchBox from '../../../../components/SearchBox';
import Select from '../../../../components/Select';
import { T } from '../../../../context/TranslationContext';
import Tooltip from '../../../../components/Tooltip';
import { useTranslation } from '../../../../hooks/useTranslation';
import folderIcon from '../../../../assets/images/folder.png';
import moreIcon from '../../../../assets/images/more.png';
import './index.scss';
import classNames from 'classnames';
import LButton from '../../../../components/LButton';
import { displayTime, profileIcons } from '../../../../utils';
import React from 'react';
import { invoke } from '@tauri-apps/api';
import { AboutContext } from '../../../../context/AboutContext';

interface IMinecraftProfile {
  id: string;
  type: string;
  name: string;
  icon: string;
  versionId: string;
  created: string;
  lastUsed: string;
  lastTimePlayed: number;
  totalTimePlayed: number;
  dirName: string;
}

const InstallationItem: React.FC<{
  profile: IMinecraftProfile;
  onSelect?: (profile: IMinecraftProfile) => void;
  onPlay?: (profile: IMinecraftProfile) => void;
  onFolder?: (profile: IMinecraftProfile) => void;
  onEdit?: (profile: IMinecraftProfile) => void;
  onDuplicate?: (profile: IMinecraftProfile) => void;
  onDelete?: (profile: IMinecraftProfile) => void;
}> = ({ profile, onSelect, onPlay, onDelete, onDuplicate, onEdit, onFolder }) => {
  const [showTools, setShowTools] = useState(false);

  const tRef = useRef(null);

  const handleClickOutside = (ev: MouseEvent) => {
    // @ts-ignore
    if (tRef.current && !tRef.current.contains(ev.target)) {
      setShowTools(false);
    }
  };

  const handleClickOutsideWindow = (ev: FocusEvent) => {
    setShowTools(false);
  };

  const { versionManifestV2 } = useContext(AboutContext);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleClickOutsideWindow);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleClickOutsideWindow);
    };
  }, []);

  return (
    <div className={classNames('installation-item', { '_has-bottom': profile.lastTimePlayed > 0 || profile.totalTimePlayed > 0 })}>
      <div
        tabIndex={0}
        className="installation-btn"
        onClick={() => {
          if (onSelect) onSelect(profile);
        }}
      >
        <div className="installation-icon">
          <img src={profile.icon.startsWith('data:image/') ? profile.icon : profileIcons.includes(profile.icon) ? '/images/installation_icons/' + profile.icon + '.png' : '/images/installation_icons/Furnace.png'} alt="icon" />
        </div>
        <div className="installation-info">
          <p>{profile.versionId === 'latest-release' ? 'Latest Release' : profile.versionId === 'latest-beta' ? 'Latest Beta' : profile.versionId === 'latest-preview' ? 'Latest Preview' : profile.name}</p>
          {versionManifestV2 != null && (
            <span>
              {profile.versionId === 'latest-release'
                ? versionManifestV2.lastest.release
                : profile.versionId === 'latest-beta'
                ? versionManifestV2.lastest.beta
                : profile.versionId === 'latest-preview'
                ? versionManifestV2.lastest.preview
                : profile.name}
            </span>
          )}
          {versionManifestV2 == null && <span>{profile.versionId}</span>}
          <div className="playtime">
            {profile.lastTimePlayed > 0 && <p className="lasttime">Last Playtime: {displayTime(profile.lastTimePlayed)}</p>}
            {profile.totalTimePlayed > 0 && <p className="totaltime">Total Playtime: {displayTime(profile.totalTimePlayed)}</p>}
          </div>
        </div>
        <div className="installation-item-tools">
          <LButton
            text="Play"
            type="green"
            onClick={(e) => {
              e.preventDefault();
              if (onPlay) onPlay(profile);
            }}
          />
          <LButton
            icon={folderIcon}
            onClick={(e) => {
              e.preventDefault();
              if (onFolder) onFolder(profile);
            }}
          />
          <LButton
            icon={moreIcon}
            onClick={(e) => {
              e.preventDefault();
              setShowTools(true);
            }}
          />
          {showTools && (
            <div ref={tRef} className="edit-tools">
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTools(false);
                  if (onEdit) onEdit(profile);
                }}
              >
                <T>Edit</T>
              </button>
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTools(false);
                  if (onDuplicate) onDuplicate(profile);
                }}
              >
                <T>Duplicate</T>
              </button>
              {profile.type === 'custom' && (
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTools(false);
                    if (onDelete) onDelete(profile);
                  }}
                >
                  <T>Delete</T>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Installations: React.FC = () => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMsg, setErrorDialogMsg] = useState('');

  const [profiles, setProfiles] = useState<IMinecraftProfile[]>([
    {
      id: '5345346',
      type: 'custom',
      name: 'Dest',
      icon: 'Andesite',
      versionId: '1.19.2',
      created: new Date('2022-10-16').toJSON(),
      lastUsed: new Date('2022-11-17').toJSON(),
      lastTimePlayed: 22220,
      totalTimePlayed: 222220,
      dirName: ''
    }
  ]);

  const [results, setResults] = useState(0);
  const [filterText, setFilterText] = useState('');
  const handleFilterTextChange = (value: string) => {
    setFilterText(value);
    if (value === '') setResults(0);
    if (value !== '') setResults(profiles.filter((v) => v.name.toLowerCase().includes(value.toLowerCase())).length);
  };

  const { t } = useTranslation();

  const [showReleases, setShowReleases] = useState(true);
  const [showBetas, setShowBetas] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    invoke('get_profiles').then((data) => {
      const prof: IMinecraftProfile[] = [];
      Object.entries(data as any).forEach(([k, v]) => {
        prof.push({
          id: k,
          ...(v as any)
        });
      });

      setProfiles(prof);
    });
  }, []);

  return (
    <>
      <ErrorPopup title={errorDialogTitle.length === 0 ? 'Error' : errorDialogTitle} message={errorDialogMsg} isOpen={showErrorDialog} onClose={() => setShowErrorDialog(false)} />
      <div className="installations">
        <div className="installs-filters">
          <div className="installs-filters-inside">
            <div className="search-filter">
              <p className="filter-name">
                <T>Search</T>
              </p>
              <SearchBox results={results} value={filterText} placeholder={t('Installation name')} handleFilter={handleFilterTextChange} />
            </div>
            <div className="filter-divider"></div>
            <div className="sortby-filter">
              <p className="filter-name">
                <T>Sort By</T>
              </p>
              <Select
                width={120}
                defaultValue={sortBy}
                noBackground
                options={[
                  { label: t('Last played'), value: 'last-played' },
                  { label: t('Name'), value: 'name' }
                ]}
                onChange={(idx, vl) => {
                  setSortBy(vl);
                }}
              />
            </div>
            <div className="filter-divider"></div>
            <div className="versions-filter">
              <p>
                <T>Versions</T>
              </p>
              <div className="versions-filter-wrapper">
                <Checkbox
                  label="Releases"
                  id="versions/releases"
                  checked={showReleases}
                  onChange={(ev, checked, prop) => {
                    setShowReleases(checked);
                  }}
                />
                <Tooltip tooltip="Run beta versions in a separate game directory to avoid corrupting your worlds.">
                  <Checkbox
                    label="Betas"
                    id="versions/betas"
                    checked={showBetas}
                    onChange={(ev, checked, prop) => {
                      setShowBetas(checked);
                    }}
                  />
                </Tooltip>
                <Checkbox
                  label="Previews"
                  id="versions/previews"
                  checked={showPreview}
                  onChange={(ev, checked, prop) => {
                    setShowPreview(checked);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', background: 'var(--divider)', height: '1px' }}></div>
        <div className="installations-list">
          <div className="create-btn">
            <div className="create-btn-inside">
              <LButton text="New installation" />
            </div>
          </div>
          <div className="divider"></div>
          {profiles
            .filter((prof) => {
              if (!(filterText === '' || prof.name.toLowerCase().includes(filterText.toLowerCase()))) {
                return false;
              }
              return true;
            })
            .sort((a, b) => {
              if (sortBy === 'name') {
                return a.name > b.name ? 1 : -1;
              } else if (sortBy === 'last-played') {
                return new Date(a.lastUsed).getTime() < new Date(b.lastUsed).getTime() ? 1 : -1;
              }

              return 0;
            })
            .map((profile, idx) => (
              <React.Fragment key={profile.id}>
                {idx !== 0 && <div className="divider"></div>}
                <InstallationItem
                  profile={profile}
                  onSelect={() => {}}
                  onPlay={() => {}}
                  onEdit={() => {}}
                  onDuplicate={() => {
                    invoke<{ message?: string; title?: string; success: boolean }>('duplicate_profile', { profileId: profile.id + 'm', duplicateProfileId: crypto.randomUUID().replace(/-/g, '') }).then((res) => {
                      if (res.success) {
                      } else {
                        setErrorDialogTitle(res.title ?? '');
                        setErrorDialogMsg(res.message ?? '');
                        setShowErrorDialog(true);
                      }
                    });
                  }}
                  onFolder={() => {}}
                  onDelete={() => {
                    invoke<{ message?: string; title?: string; success: boolean }>('delete_profile', { profileId: profile.id }).then((res) => {
                      if (!res.success) {
                        setErrorDialogTitle(res.title ?? '');
                        setErrorDialogMsg(res.message ?? '');
                        setShowErrorDialog(true);
                      }
                    });
                  }}
                />
              </React.Fragment>
            ))}
        </div>
      </div>
    </>
  );
};

export default Installations;
