import React from 'react';
import { useState } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import SearchBox from '../../../../components/SearchBox';
import { T } from '../../../../context/TranslationContext';
import Checkbox from '../../../../components/Checkbox';
import LButton from '../../../../components/LButton';
import './index.scss';
import VersionItem from './components/VersionItem';
import RemovePopup from './components/RemovePopup';

interface VersionInfo {
  id: string;
  type: 'release' | 'beta' | 'preview';
  uuid: string;
  size: number;
}

const Versions: React.FC = () => {
  const [versions, setVersions] = useState<VersionInfo[]>([
    /* Dev
    {
      id: '1.19.40.24',
      type: 'preview',
      uuid: 'd54c5515-febf-46cf-9c02-e02db95aa463',
      size: 1003163000
    },
    {
      id: '1.19.43.24',
      type: 'beta',
      uuid: 'd54c5515-febf-46cf-9c02-e02db95aa463',
      size: 1003163000
    },
    {
      id: '1.19.31.1',
      type: 'release',
      uuid: '3702b4c4-d244-4e7c-9566-d5fa97df02ef',
      size: 983160000
    }
    */
  ]);

  const [showReleases, setShowReleases] = useState(true);
  const [showBetas, setShowBetas] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const { t } = useTranslation();

  const [results, setResults] = useState(0);
  const [filterText, setFilterText] = useState('');
  const handleFilterTextChange = (value: string) => {
    setFilterText(value);
    if (value === '') setResults(0);
    if (value !== '') setResults(versions.filter((v) => v.id.toLowerCase().includes(value.toLowerCase())).length);
  };

  return (
    <>
      <RemovePopup
        isOpen={showDeletePopup}
        version={{ id: '', uuid: '', size: 0, type: 'release' }}
        onClose={() => {
          setShowDeletePopup(false);
        }}
        onConfirm={() => {
          setShowDeletePopup(false);
        }}
      />
      <div className="local-versions">
        <div className="local-versions-filter-content">
          <div className="filter-content-inside">
            <div className="search-filter">
              <p className="filter-name">
                <T>Search</T>
              </p>
              <SearchBox results={results} value={filterText} placeholder={t('Version identifier')} handleFilter={handleFilterTextChange} />
            </div>
            <div className="filter-divider"></div>
            <div className="versions-filter">
              <p>
                <T>Versions</T>
              </p>
              <div className="versions-filter-wrapper">
                <Checkbox
                  label={t('Release')}
                  id="versions/releases"
                  checked={showReleases}
                  onChange={(ev, checked, prop) => {
                    setShowReleases(checked);
                  }}
                />
                <Checkbox
                  label={t('Beta')}
                  id="versions/betas"
                  checked={showBetas}
                  onChange={(ev, checked, prop) => {
                    setShowBetas(checked);
                  }}
                />
                <Checkbox
                  label={t('Preview')}
                  id="versions/previews"
                  checked={showPreviews}
                  onChange={(ev, checked, prop) => {
                    setShowPreviews(checked);
                  }}
                />
              </div>
            </div>
            <div style={{ width: '100%' }}></div>
            <div className="refresh">
              <LButton text="Refresh" />
            </div>
          </div>
        </div>
        <div style={{ width: '100%', background: 'var(--divider)', height: '1px' }}></div>
        <div className="versions-list">
          {versions.length === 0 && (
            <p
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                fontFamily: 'Noto Sans',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                translate: '-50% -50%'
              }}
            >
              <T>No versions installed locally</T>
            </p>
          )}
          {versions
            .filter((version) => {
              if (!(filterText === '' || version.id.toLowerCase().includes(filterText.toLowerCase()))) {
                return false;
              }

              if (!showBetas && !showReleases) return true;
              if (version.type === 'release' && showReleases) return true;
              else if (version.type === 'beta' && showBetas) return true;
              else if (version.type === 'preview' && showPreviews) return true;
              return false;
            })
            .map((version, idx) => {
              return (
                <React.Fragment key={version.id}>
                  {idx !== 0 && <div className="divider"></div>}
                  <VersionItem
                    info={version}
                    onRemove={() => {
                      setShowDeletePopup(true);
                    }}
                  />
                </React.Fragment>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Versions;
