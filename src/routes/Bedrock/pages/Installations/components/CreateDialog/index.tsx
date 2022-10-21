import React from 'react';
import ReactModal from 'react-modal';
import LButton from '../../../../../../components/LButton';
import { T } from '../../../../../../context/TranslationContext';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/close.svg';

const CreateDialog: React.FC<{ isOpen?: boolean; onCreate?: () => void; onClose?: () => void }> = ({ isOpen = false, onClose, onCreate }) => {
  return (
    <ReactModal isOpen={isOpen} className="modal-dialog" overlayClassName="modal-overlay" onRequestClose={onClose}>
      <header>
        <h2>
          <T>Create new installation</T>
        </h2>
        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon className="close-icon" />
        </button>
      </header>
      <main></main>
      <footer>
        <LButton
          text="Cancel"
          onClick={() => {
            if (onClose) onClose();
          }}
        />
        <LButton
          text="Create"
          type="green"
          onClick={() => {
            if (onCreate) onCreate();
          }}
        />
      </footer>
    </ReactModal>
  );
};

export default CreateDialog;
