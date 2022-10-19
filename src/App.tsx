import { useContext, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainMenuTab, { MainMenuButton } from './components/MainMenuTab';
import iconLauncherNew from './assets/main_menu_icons/lnew_icon.png';
import iconBedrock from './assets/main_menu_icons/bedrock_icon.png';
import iconSettings from './assets/main_menu_icons/settings_icon.png';
import iconNews from './assets/main_menu_icons/news_icon.png';
import { AboutContext } from './context/AboutContext';
import News from './routes/News';
import Settings from './routes/Settings';
import Bedrock from './routes/Bedrock';
import LauncherNewsDialog from './components/LauncherNewsDialog';

function App() {
  const [showDialog, setShowDialog] = useState(false);
  const { app: appInfo } = useContext(AboutContext);

  return (
    <>
      <LauncherNewsDialog
        isOpen={showDialog}
        onClose={() => {
          localStorage.setItem('lastLauncherNewsSeenVersion', appInfo.version);
          setShowDialog(false);
        }}
      />
      <HashRouter>
        <div className="app">
          <div className="main-menu">
            <MainMenuTab title="News" icon={iconNews} path="/news" />
            <MainMenuTab title="Minecraft:" subtitle="Bedrock Edition" icon={iconBedrock} path="/bedrock" />
            <div className="fill-v"></div>
            <MainMenuButton
              title="What's New"
              icon={iconLauncherNew}
              newIcon={appInfo.version === '0.0.0' ? false : localStorage.getItem('lastLauncherNewsSeenVersion') == null || localStorage.getItem('lastLauncherNewsSeenVersion') !== appInfo.version}
              onClick={() => setShowDialog(true)}
            />
            <MainMenuTab title="Settings" icon={iconSettings} path="/settings" />
            <span className="launcher-version">v{appInfo.version}</span>
          </div>
          <div className="route-root">
            <Routes>
              <Route path="/" element={<Navigate to="/bedrock" />} />
              <Route path="/news/*" element={<News />} />
              <Route path="/bedrock/*" element={<Bedrock />} />
              <Route path="/settings/*" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </>
  );
}

export default App;
