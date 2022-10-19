import { Routes, Route, Navigate } from 'react-router-dom';
import SubMenu from '../../components/SubMenu';
import About from './pages/About';
import Accounts from './pages/Accounts';
import General from './pages/General';
import Versions from './pages/Versions';

const Settings: React.FC = () => {
  return (
    <>
      <SubMenu>
        <SubMenu.Title text="Settings" />
        <SubMenu.Navbar>
          <SubMenu.Link to="/settings/general" text="General" />
          <SubMenu.Link to="/settings/versions" text="Versions" />
          <SubMenu.Link to="/settings/accounts" text="Accounts" />
          <SubMenu.Link to="/settings/about" text="About" />
        </SubMenu.Navbar>
      </SubMenu>
      <div className="subroute-page">
        <Routes location={location.pathname.split('/')[1]}>
          <Route path="/" element={<Navigate to="/settings/general" replace />} />
          <Route path="/general" element={<General />} />
          <Route path="/versions" element={<Versions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </>
  );
};

export default Settings;
