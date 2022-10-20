import { useContext, useState } from 'react';
import Checkbox from '../../../../components/Checkbox';
import LButton from '../../../../components/LButton';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { PatchNotesContext } from '../../../../context/PatchNotesContext';
import { T } from '../../../../context/TranslationContext';
import PatchNotesList from './components/PatchNotesList';
import './index.scss';

const PatchNotes: React.FC = () => {
  const { bedrock, refresh } = useContext(PatchNotesContext);

  const [releases, setReleases] = useState(true);
  const [betas, setBetas] = useState(true);
  const [previews, setPreviews] = useState(true);

  return (
    <div className="pn-content">
      <div className="pn-filter-content">
        <div className="pn-filter-content-inside">
          <div className="pn-versions-filter">
            <p>
              <T>Versions</T>
            </p>
            <div className="pn-versions-filter-wrapper">
              <Checkbox
                label="Release"
                id="bedrock:patchNotes/releases"
                checked={releases}
                onChange={(ev, checked, prop) => {
                  setReleases(checked);
                }}
              />
              <Checkbox
                label="Beta"
                id="bedrock:patchNotes/betas"
                checked={betas}
                onChange={(ev, checked, prop) => {
                  setBetas(checked);
                }}
              />
              <Checkbox
                label="Preview"
                id="bedrock:patchNotes/previews"
                checked={previews}
                onChange={(ev, checked, prop) => {
                  setPreviews(checked);
                }}
              />
            </div>
          </div>
          <div className="refresh">
            <LButton text="Refresh" onClick={() => refresh('bedrockPatchNotes')} />
          </div>
        </div>
      </div>
      <div style={{ minHeight: '1px', height: '1px', width: '100%', background: 'var(--divider)' }}></div>
      <div className="pn-cards-content">
        {bedrock.length === 0 && <LoadingSpinner style={{ position: 'relative', top: '50%', left: 'calc(50% - 25px)', height: '40px', translate: '-50% -100%' }} />}
        {bedrock.length > 0 && <PatchNotesList patchNotes={bedrock} showBetas={betas} showPreviews={previews} showReleases={releases} />}
      </div>
    </div>
  );
};

export default PatchNotes;
