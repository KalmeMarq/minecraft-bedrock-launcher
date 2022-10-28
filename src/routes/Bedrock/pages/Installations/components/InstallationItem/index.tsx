import classNames from 'classnames';
import { useState, useRef, useContext, useEffect } from 'react';
import LButton from '../../../../../../components/LButton';
import { AboutContext } from '../../../../../../context/AboutContext';
import { T } from '../../../../../../context/TranslationContext';
import { profileIcons, displayTime } from '../../../../../../utils';
import folderIcon from '../../../../../../assets/images/folder.png';
import moreIcon from '../../../../../../assets/images/more.png';

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
                ? versionManifestV2.latest.release
                : profile.versionId === 'latest-beta'
                ? versionManifestV2.latest.beta
                : profile.versionId === 'latest-preview'
                ? versionManifestV2.latest.preview
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

export default InstallationItem;
