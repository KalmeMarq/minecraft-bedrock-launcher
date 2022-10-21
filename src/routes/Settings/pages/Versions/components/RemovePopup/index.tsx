import ReactModal from 'react-modal';
import LButton from '../../../../../../components/LButton';
import { T } from '../../../../../../context/TranslationContext';
import { useTranslation } from '../../../../../../hooks/useTranslation';

interface VersionInfo {
  id: string;
  type: 'release' | 'beta' | 'preview';
  uuid: string;
  size: number;
}

const RemovePopup: React.FC<{ isOpen?: boolean; onClose?: () => void; version: VersionInfo; onConfirm?: () => void }> = ({ isOpen = false, onClose, version, onConfirm }) => {
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

export default RemovePopup;
