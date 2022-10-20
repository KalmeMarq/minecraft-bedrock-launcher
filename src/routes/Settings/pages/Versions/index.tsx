import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import folderIcon from '../../../../assets/images/folder.png';
import SearchBox from '../../../../components/SearchBox';
import { T } from '../../../../context/TranslationContext';
import Checkbox from '../../../../components/Checkbox';
import LButton from '../../../../components/LButton';
import { filesize } from 'filesize';
import moreIcon from '../../../../assets/images/more.png';
import './index.scss';
import ReactModal from 'react-modal';

interface VersionInfo {
  id: string;
  type: 'release' | 'beta' | 'preview';
  uuid: string;
  size: number;
}

export const DeletePopup: React.FC<{ isOpen?: boolean; onClose?: () => void; version: VersionInfo; onConfirm?: () => void }> = ({ isOpen = false, onClose, version, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <ReactModal isOpen={isOpen} className="modal-dialog delete-popup" shouldCloseOnOverlayClick={true} overlayClassName="modal-overlay delete-popup-overlay" onRequestClose={onClose}>
      <div className="delete-popup-content">
        <p className="question">
          <T>Are you sure you want to delete?</T>
        </p>
        <p className="version-id">
          <p>{version.id}</p> <p>{version.uuid}</p>
        </p>
        <div className="popup-buttons">
          <LButton text={t('Cancel')} onClick={onClose} />
          <LButton text={t('Delete')} type="red" onClick={onConfirm} />
        </div>
      </div>
    </ReactModal>
  );
};

const VersionItem: React.FC<{ info: VersionInfo; onRepair?: () => void; onFolder?: () => void; onRemove?: () => void }> = ({ info, onRepair, onFolder, onRemove }) => {
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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleClickOutsideWindow);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleClickOutsideWindow);
    };
  }, []);

  return (
    <>
      <div className="version-item">
        <div tabIndex={0} className="version-btn">
          <div className="version-info">
            <p>
              {info.id} {info.type === 'preview' && <span className={'tag preview'}>Preview</span>} {info.type === 'beta' && <span className={'tag beta'}>Beta</span>}
            </p>
            <span>{info.uuid}</span>
            <span dir="ltr">{filesize(info.size) as string}</span>
          </div>
          <div className="version-item-tools">
            <LButton text="Repair" type="green" />
            <LButton icon={folderIcon} />
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
                    if (onRemove) onRemove();
                  }}
                >
                  <T>Remove</T>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

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
      <DeletePopup
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
