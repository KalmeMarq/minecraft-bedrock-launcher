import ReactModal from 'react-modal';
import { ModalDialog } from '../../../../../../components/ModalDialog';
import { MinecraftPatchNote } from '../../../../../../context/PatchNotesContext';
import { useTranslation } from '../../../../../../hooks/useTranslation';
import './index.scss';

const PatchNotesDialog: React.FC<{ patch: MinecraftPatchNote; isOpen?: boolean; onClose?: () => void }> = ({ patch, isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <ModalDialog isOpen={isOpen} title={`${t('Patch Notes')} ${patch.version}`} onClose={onClose}>
      <div
        className="mc-patchnote-list"
        dangerouslySetInnerHTML={{
          __html: patch.body.replaceAll('<br>', '').replaceAll('</br>', '') /* .replace(/(\s*\(\s*)((<a.+<\/a>))(\s*\)\s*)/g, (a, b, c, d, e) => {
            return c;
          }) */
        }}
      ></div>
    </ModalDialog>
  );
};

export default PatchNotesDialog;
