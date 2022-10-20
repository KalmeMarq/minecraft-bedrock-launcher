import { useContext, useState } from 'react';
import Checkbox from '../../../../components/Checkbox';
import LButton from '../../../../components/LButton';
import Select from '../../../../components/Select';
import { T } from '../../../../context/TranslationContext';
import './index.scss';
import translations from '../../../../assets/translations.json';
import { banners, SettingsContext } from '../../../../context/SettingsContext';

const General: React.FC = () => {
  const { keepLauncherOpen, animatePages, bannerTheme, setSetting, theme, language, themes, refreshThemes } = useContext(SettingsContext);

  const [forceRTL, setForceRTL] = useState(false);
  const [beforeForced, setBeforeForced] = useState('ltr');

  return (
    <div className="settings-general-content">
      <div className="select-container">
        <label className="select-label">
          <T>Language</T>
        </label>
        <Select
          width={330}
          defaultValue={'en-US'}
          options={translations.languages.map((lang) => {
            return { label: lang.localName, value: lang.locale };
          })}
          onChange={(idx, vl) => {
            setSetting('language', vl);
          }}
        />
      </div>
      <div className="select-container">
        <label className="select-label">
          <T>Banner Theme</T>
        </label>
        <Select
          width={330}
          defaultValue={bannerTheme}
          options={banners.map(({ label, value }) => {
            return { label, value };
          })}
          onChange={(idx, vl) => {
            setSetting('bannerTheme', vl.toLowerCase());
          }}
        />
      </div>
      <div className="select-container">
        <label className="select-label">
          <T>Theme</T>
        </label>
        <Select
          width={330}
          defaultValue={theme}
          options={[{ name: 'Dark' }, { name: 'Light' }].map((th) => {
            return { label: th.name, value: th.name.toLowerCase() };
          })}
          onChange={(idx, vl) => {
            setSetting('theme', vl.toLowerCase());
          }}
        />
      </div>
      <LButton
        text="Refresh Themes"
        style={{ maxWidth: 'max-content' }}
        onClick={() => {
          // refreshThemes();
        }}
      />
      <div style={{ height: '12px' }}></div>
      <h3>
        <T>Launcher Settings</T>
      </h3>
      <Checkbox
        label="Keep the Launcher open while games are running"
        id="keepLauncherOpen"
        checked={keepLauncherOpen}
        onChange={(ev, checked, prop) => {
          setSetting(prop, checked).then(() => {});
          console.log(prop, checked);
        }}
      />
      <Checkbox
        label="Animate transitions between pages in the Launcher"
        id="animatePages"
        checked={animatePages}
        onChange={(ev, checked, prop) => {
          setSetting(prop, checked).then(() => {});
          console.log(prop, checked);
        }}
      />
      <Checkbox
        label="Force right to left layout"
        id="forceRTL"
        checked={forceRTL}
        onChange={(ev, checked, prop) => {
          if (checked) {
            setBeforeForced(document.body.dir);
          }
          setForceRTL(checked);
          document.body.dir = checked ? 'rtl' : beforeForced;
          console.log(prop, checked);
        }}
      />
    </div>
  );
};

export default General;
