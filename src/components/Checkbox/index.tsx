import { invoke } from '@tauri-apps/api';
import React, { useCallback, useRef, useState } from 'react';
import './index.scss';
import { ReactComponent as CheckIcon } from '../../assets/icons/check.svg';
import { useTranslation } from '../../hooks/useTranslation';

interface ICheckboxProps {
  label: string;
  id: string;
  title?: string;
  disabled?: boolean;
  checked: boolean;
  onChange?: (event: React.ChangeEvent<HTMLElement>, isChecked: boolean, prop: string) => void;
}

const Checkbox: React.FunctionComponent<ICheckboxProps> = ({ title, id, label, disabled, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const { t } = useTranslation();

  const onValueChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked);
    if (onChange) onChange(ev, !isChecked, id);
  };

  return (
    <div className="checkbox">
      <label>
        <div className="check-box">
          <input type="checkbox" checked={isChecked} disabled={disabled} title={title} onChange={onValueChanged} />
          <div className="check-fake">
            <CheckIcon className="check" />
          </div>
        </div>
        <span>{t(label)}</span>
      </label>
    </div>
  );
};

export default Checkbox;
