import { Routes, Route, Navigate } from 'react-router-dom';
import SubMenu from '../../components/SubMenu';
import Installations from './pages/Installations';
import PatchNotes from './pages/PatchNotes';
import Play from './pages/Play';

const Bedrock: React.FC = () => {
  return (
    <>
      <SubMenu>
        <SubMenu.Title text="Minecraft: Bedrock Edition" />
        <SubMenu.Navbar>
          <SubMenu.Link to="/bedrock/play" text="Play" />
          <SubMenu.Link to="/bedrock/installations" text="Installations" />
          <SubMenu.Link to="/bedrock/patchnotes" text="Patch Notes" />
        </SubMenu.Navbar>
      </SubMenu>
      <div className="subroute-page">
        <Routes location={location.pathname.split('/')[1]}>
          <Route path="/" element={<Navigate to="/bedrock/play" replace />} />
          <Route path="/play" element={<Play />} />
          <Route path="/installations" element={<Installations />} />
          <Route path="/patchnotes" element={<PatchNotes />} />
        </Routes>
      </div>
    </>
  );
};

export default Bedrock;
