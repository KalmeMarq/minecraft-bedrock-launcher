import { filesize } from 'filesize';
import { useState, useRef, useEffect } from 'react';
import LButton from '../../../../../../components/LButton';
import { T } from '../../../../../../context/TranslationContext';
import folderIcon from '../../../../../../assets/images/folder.png';
import moreIcon from '../../../../../../assets/images/more.png';

interface VersionInfo {
  id: string;
  type: 'release' | 'beta' | 'preview';
  uuid: string;
  size: number;
}

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

export default VersionItem;
