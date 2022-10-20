import { MinecraftPatchNote } from '../../../../../../context/PatchNotesContext';
import './index.scss';
import bugrockIcon from '../../../../../../assets/images/bugrock.png';
import classNames from 'classnames';

const PatchNoteCard: React.FC<{ patch: MinecraftPatchNote; onCardClick: (id: string) => void; style?: React.CSSProperties }> = ({ patch, onCardClick, style }) => {
  return (
    <button className={classNames('patch-card', { 'show-platforms': patch.platforms && !patch.platforms.includes('All') })} onClick={() => onCardClick(patch.id)} style={style}>
      <div className="card-inside">
        <div className="card-top">
          {patch.image ? <img src={patch.image.url.replaceAll('/main/images/', '/master/images/patchnotes/').replace(/\/\d+.png/g, '.png')} alt={patch.image.title} /> : <img src={bugrockIcon} alt="no image" className="bugrock-icon" />}
        </div>
        <div className={classNames('card-bottom')}>
          {patch.title}
          {patch.platforms && !patch.platforms.includes('All') && (
            <div className="platforms">
              {patch.platforms.map((plat) => (
                <span key={plat} className="plat">
                  {plat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default PatchNoteCard;
