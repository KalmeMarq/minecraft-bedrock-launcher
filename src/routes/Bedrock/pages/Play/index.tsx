import { useContext } from 'react';
import PlayButton from '../../../../components/PlayButton';
import { ReactComponent as BedrockLogo } from '../../../../assets/images/bedrock_logo.svg';
import { banners, SettingsContext } from '../../../../context/SettingsContext';
import { T } from '../../../../context/TranslationContext';
import './index.scss';
import { NewsContext } from '../../../../context/NewsContext';
import HighlightedNewsItem from './components/HighlightedNewsItem';

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
          .filter((n) => n.newsType.includes('Bedrock'))
          .slice(0, 10)
          .map((b) => (
            <HighlightedNewsItem data={b} key={b.id} />
          ))}
        <div className="system-requirements">
          <h3>System Requirements</h3>
          <table>
            <tr>
              <th></th>
              <th>Minimum Requirements:</th>
              <th>Recommended Requirements:</th>
            </tr>
            <tr>
              <td>OS</td>
              <td>Windows 10 version 14393.0 or higher</td>
              <td>Windows 10 version 14393.0 or higher</td>
            </tr>
            <tr>
              <td>Architecture</td>
              <td>ARM, x64, x86</td>
              <td>ARM, x64, x86</td>
            </tr>
            <tr>
              <td>Memory</td>
              <td>4 GB</td>
              <td>8 GB</td>
            </tr>
            <tr>
              <td>Motion Controller</td>
              <td>Not specified</td>
              <td>Windows Mixed Reality motion controllers</td>
            </tr>
            <tr>
              <td>Headset</td>
              <td>Not specified</td>
              <td>Windows Mixed Reality immersive headset</td>
            </tr>
            <tr>
              <td>Processor</td>
              <td>Intel Celeron J4105 | AMD FX-4100</td>
              <td>Intel i7-6500U | AMD A8-6600K</td>
            </tr>
            <tr>
              <td>Graphics</td>
              <td>Intel HD Graphics 4000 | AMD Radeon RS</td>
              <td>NVIDIA GeForce 940M | AMD Radeon HD 8570D</td>
            </tr>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Play;
