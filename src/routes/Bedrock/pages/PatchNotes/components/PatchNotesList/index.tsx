import { useState } from 'react';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';
import { MinecraftPatchNote } from '../../../../../../context/PatchNotesContext';
import PatchNoteCard from '../PatchNoteCard';
import PatchNotesDialog from '../PatchNotesDialog';
import './index.scss';

const PatchNotesList: React.FC<{ patchNotes: MinecraftPatchNote[]; showReleases?: boolean; showPreviews?: boolean; showBetas?: boolean }> = ({ patchNotes, showPreviews, showBetas, showReleases = true }) => {
  const [showPatchDialog, setShowPatchDialog] = useState(false);
  const [noteSelected, setNoteSelected] = useState<null | MinecraftPatchNote>(null);

  return (
    <>
      {noteSelected !== null && (
        <PatchNotesDialog
          isOpen={showPatchDialog}
          onClose={() => {
            setShowPatchDialog(false);
            setNoteSelected(null);
          }}
          patch={noteSelected}
        />
      )}
      <div className="patch-list">
        {patchNotes.length === 0 && <LoadingSpinner />}
        {patchNotes
          // .sort((a, b) => {
          //   return new Date(a.date).getTime() < new Date(b.date).getTime() ? 1 : -1;
          // })
          .map((note) => (
            <PatchNoteCard
              key={note.id}
              patch={note}
              style={{
                display: (() => {
                  if (!showReleases && !showBetas) return true;
                  if (note.type === 'beta' && showBetas) return true;
                  else if (note.type === 'preview' && showPreviews) return true;
                  else if (note.type === 'release' && showReleases) return true;
                  return false;
                })()
                  ? 'block'
                  : 'none'
              }}
              onCardClick={(id) => {
                setNoteSelected(patchNotes.find((p) => p.id === id) ?? null);
                setShowPatchDialog(true);
              }}
            />
          ))}
      </div>
    </>
  );
};

export default PatchNotesList;
