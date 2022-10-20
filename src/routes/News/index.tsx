import classNames from 'classnames';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { ReactComponent as MCLogo } from '../../assets/images/minecraft_title.svg';
import { T } from '../../context/TranslationContext';
import { useTranslation } from '../../hooks/useTranslation';
import './index.scss';
import Forum from './pages/Forum';
import Official from './pages/Official';
import Top from './pages/Top';

const News: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="news-pages">
      <header>
        <MCLogo className="mc-logo" />
      </header>
      <nav className="subnavbar">
        <ul>
          <li>
            <NavLink title={t('Minecraft')} className={({ isActive }) => classNames({ active: isActive })} to="/news/official">
              <T>Minecraft</T>
            </NavLink>
          </li>
          <li>
            <NavLink title={t('Minecraft Forum')} className={({ isActive }) => classNames({ active: isActive })} to="/news/forum">
              <T>Minecraft Forum</T>
            </NavLink>
          </li>
          <li>
            <NavLink title={t('Minecraft Top')} className={({ isActive }) => classNames({ active: isActive })} to="/news/top">
              <T>Minecraft Top</T>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div style={{ minHeight: '1px', background: 'var(--divider)', marginTop: '2px' }}></div>
      <Routes>
        <Route path="/" element={<Navigate to="/news/official" replace />} />
        <Route path="/official" element={<Official />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/top" element={<Top />} />
      </Routes>
    </div>
  );
};

export default News;
