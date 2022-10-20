import { useContext } from 'react';
import PlayButton from '../../../../components/PlayButton';
import { banners, SettingsContext } from '../../../../context/SettingsContext';
import { T } from '../../../../context/TranslationContext';
import './index.scss';

const Play: React.FC = () => {
  const { bannerTheme } = useContext(SettingsContext);

  return (
    <div className="play-content">
      <div
        className="banner"
        style={{
          background: 'url(' + banners.find((b) => b.value === bannerTheme)!.image + ')',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 50%',
          backgroundSize: 'cover'
        }}
      ></div>
      <div className="bar">
        <PlayButton disabled>
          <T>Play</T>
        </PlayButton>
      </div>
    </div>
  );
};

export default Play;
