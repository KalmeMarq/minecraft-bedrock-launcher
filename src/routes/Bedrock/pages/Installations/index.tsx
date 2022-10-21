import { useContext, useEffect, useRef, useState } from 'react';
import ErrorPopup from './components/ErrorPopup';
import Checkbox from '../../../../components/Checkbox';
import SearchBox from '../../../../components/SearchBox';
import Select from '../../../../components/Select';
import { T } from '../../../../context/TranslationContext';
import Tooltip from '../../../../components/Tooltip';
import { useTranslation } from '../../../../hooks/useTranslation';
import './index.scss';
import LButton from '../../../../components/LButton';
import React from 'react';
import { invoke } from '@tauri-apps/api';
import CreateDialog from './components/CreateDialog';
import EditDialog from './components/EditDialog';
import InstallationItem from './components/InstallationItem';

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

const Installations: React.FC = () => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMsg, setErrorDialogMsg] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
      <CreateDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
        }}
      />
      <EditDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
        }}
      />
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
              <LButton text="New installation" onClick={() => setShowCreateDialog(true)} />
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
                  onEdit={() => {
                    setShowEditDialog(true);
                  }}
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
