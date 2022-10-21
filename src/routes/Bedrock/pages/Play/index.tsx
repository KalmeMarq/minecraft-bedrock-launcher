import { useContext } from 'react';
import PlayButton from '../../../../components/PlayButton';
import { ReactComponent as BedrockLogo } from '../../../../assets/images/bedrock_logo.svg';
import { banners, SettingsContext } from '../../../../context/SettingsContext';
import { T } from '../../../../context/TranslationContext';
import './index.scss';
import { NewsContext } from '../../../../context/NewsContext';
import HighlightedNewsItem from './components/HighlightedNewsItem';
import SystemRequirements from './components/SystemRequirements';

const Play: React.FC = () => {
  const { bannerTheme } = useContext(SettingsContext);
  const { minecraft: news } = useContext(NewsContext);

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
      >
        <BedrockLogo className="bugrock-logo" />
      </div>
      <div className="bar">
        <PlayButton disabled>
          <T>Play</T>
        </PlayButton>
        <span className="username">Player</span>
      </div>
      <section className="play-news-section">
        {news
          .filter((n) => n.newsType?.includes('Bedrock'))
          .slice(0, 10)
          .map((b) => (
            <HighlightedNewsItem data={b} key={b.id} />
          ))}
        <SystemRequirements />
      </section>
    </div>
  );
};

export default Play;
