import React, { createContext, useEffect, useState } from 'react';
import enGBTranslations from '../assets/translations/en-GB.json';
import enUSTranslations from '../assets/translations/en-US.json';
import ptPTTranslations from '../assets/translations/pt-PT.json';
import ptBRTranslations from '../assets/translations/pt-BR.json';
import esESTranslations from '../assets/translations/es-ES.json';
import esMXTranslations from '../assets/translations/es-MX.json';
import translations from '../assets/translations.json';
import { invoke } from '@tauri-apps/api';
import { TranslationProvider } from './TranslationContext';

interface Theme {
  name: string;
  type: 'dark' | 'light';
  styles: Record<string, string>;
}

export const banners = [
  {
    label: 'Latest Update',
    value: 'latest',
    image: '/images/banners/wild.jpg'
  },
  {
    label: 'Wild Update',
    value: 'wild',
    image: '/images/banners/wild.jpg'
  },
  {
    label: 'Caves & Cliffs (Part 2)',
    value: 'caves-cliffs-part-two',
    image: '/images/banners/caves_cliffs_two.jpg'
  },
  {
    label: 'Caves & Cliffs (Part 1)',
    value: 'caves-cliffs-part-one',
    image: '/images/banners/caves_cliffs_one.jpg'
  },
  {
    label: 'Nether Update',
    value: 'nether',
    image: '/images/banners/nether.jpg'
  },
  {
    label: 'Buzzy Bees Update',
    value: 'buzzy-bees',
    image: '/images/banners/buzzy_bees.jpg'
  },
  {
    label: 'Villager & Pillager Update',
    value: 'villager-pillager',
    image: '/images/banners/villager_pillager.jpg'
  },
  {
    label: 'Update Aquatic',
    value: 'aquatic',
    image: '/images/banners/aquatic.jpg'
  },
  {
    label: 'Technically Updated (Java)',
    value: 'technically-java',
    image: '/images/banners/technically.jpg'
  },
  {
    label: 'World of Color Update (Java)',
    value: 'world-color-java',
    image: '/images/banners/world_of_color.jpg'
  },
  {
    label: 'Exploration Update (Java)',
    value: 'exploration-java',
    image: '/images/banners/exploration.jpg'
  },
  {
    label: 'Combat Update (Java)',
    value: 'combat-java',
    image: '/images/banners/combat.jpg'
  },
  {
    label: 'Cats & Pandas (Bedrock)',
    value: 'cats-pandas-bedrock',
    image: '/images/banners/cats_and_pandas.jpg'
  },
  {
    label: 'Official Release (Bedrock)',
    value: 'official-release-bedrock',
    image: '/images/banners/pocket_edition.jpg'
  },
  {
    label: 'Bedrock & Java (Technoblade)',
    value: 'technoblade',
    image: '/images/banners/bedrock_java_technoblade.jpg'
  },
  {
    label: 'Bedrock & Java',
    value: 'bedrock-java',
    image: '/images/banners/bedrock_java.jpg'
  },
  {
    label: 'Bedrock Edition Standard',
    value: 'bedrock-standard',
    image: '/images/banners/bedrock_standard.jpg'
  },
  {
    label: 'Bedrock Edition Master',
    value: 'bedrock-master',
    image: '/images/banners/bedrock_master.jpg'
  },
  {
    label: 'Original Legacy Console Era',
    value: 'original-legacy-console',
    image: '/images/banners/early_legacy_console.jpg'
  },
  {
    label: 'Mid Legacy Console Era',
    value: 'mid-legacy-console',
    image: '/images/banners/mid_legacy_console.jpg'
  },
  {
    label: 'Late Legacy Console Era',
    value: 'late-legacy-console',
    image: '/images/banners/late_legacy_console.jpg'
  },
  {
    label: 'Indie Days',
    value: 'indie-days',
    image: '/images/banners/indie_days.jpg'
  },
  {
    label: 'Original',
    value: 'original',
    image: '/images/banners/original_image.jpg'
  }
];

const langs: Record<string, Record<string, string>> = {
  'en-GB': enGBTranslations,
  'en-US': enUSTranslations,
  'pt-BR': ptBRTranslations,
  'pt-PT': ptPTTranslations,
  'es-ES': esESTranslations,
  'es-MX': esMXTranslations
};

export const SettingsContext = createContext<{
  keepLauncherOpen: boolean;
  animatePages: boolean;
  language: string;
  theme: string;
  bannerTheme: string;
  themes: Theme[];
  refreshThemes: () => void;
  setSetting: (option: string, value: string | number | boolean) => Promise<void>;
}>({
  keepLauncherOpen: true,
  animatePages: false,
  bannerTheme: 'lastest',
  theme: 'dark',
  language: 'en-US',
  themes: [],
  async refreshThemes() {},
  async setSetting(option: string, value: string | number | boolean) {}
});

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [keepLauncherOpen, setKeepLauncherOpen] = useState(true);
  const [animatePages, setAnimatePages] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([
    { name: 'Dark', type: 'dark', styles: {} },
    { name: 'Light', type: 'light', styles: {} }
  ]);
  const [bannerTheme, setBannerTheme] = useState<string>('latest');
  const [theme, setTheme] = useState<string>('dark');
  const [language, setLanguage] = useState<string>('en-US');

  useEffect(() => {
    async function fetchAll() {
      const klo = await invoke('get_setting', { option: 'keepLauncherOpen' });
      const ap = await invoke('get_setting', { option: 'animatePages' });
      const thm = await invoke('get_setting', { option: 'theme' });
      const bthm = await invoke('get_setting', { option: 'bannerTheme' });
      const lang = await invoke('get_setting', { option: 'language' });
      const themes = await invoke('get_themes');

      setThemes(themes as Theme[]);
      setLanguage(lang as string);
      setTheme((thm as string).toLowerCase());
      setBannerTheme((bthm as string).toLowerCase());
      setKeepLauncherOpen(klo === 'true' ? true : false);
      setAnimatePages(ap === 'true' ? true : false);
    }

    fetchAll();
  }, []);

  const applyTheme = (newTheme: string) => {
    if (themes.findIndex((th) => th.name.toLowerCase() == newTheme.toLowerCase()) >= 0) {
      document.documentElement.removeAttribute('data-allow-anim');
      const theme = themes.find((th) => th.name.toLowerCase() == newTheme.toLowerCase())!;

      const baseTheme = themes.find((th) => th.name.toLowerCase() == theme.type)!;

      const styles = {
        ...baseTheme.styles,
        ...theme.styles
      };

      Object.entries(styles).forEach(([key, value]) => {
        document.documentElement.style.setProperty('--' + key.replaceAll('.', '-'), value);
      });

      document.documentElement.setAttribute('data-allow-anim', '');
    }
  };
  applyTheme((theme as string).toLowerCase());

  async function setSetting(option: string, value: string | number | boolean) {
    if (typeof value === 'string') {
      await invoke('set_setting', { option: option, value: value });
    } else if (typeof value === 'number') {
      await invoke('set_setting', { option: option, value: `${value}` });
    } else {
      await invoke('set_setting', { option: option, value: value ? 'true' : 'false' });
    }

    if (option === 'keepLauncherOpen') {
      setKeepLauncherOpen(value as boolean);
    } else if (option === 'animatePages') {
      setAnimatePages(value as boolean);
    } else if (option === 'bannerTheme') {
      setBannerTheme(value.toString().toLowerCase());
    } else if (option === 'theme') {
      setTheme(value.toString().toLowerCase());
      applyTheme(value.toString().toLowerCase());
    } else if (option === 'language' && language !== value.toString()) {
      const info = translations.languages.find((lang) => lang.locale === value);
      if (info) {
        console.log(info);
        document.documentElement.lang = info.iso;
        document.body.dir = info.direction;

        if (info.completeness < 100) {
          // addNotification({
          //   type: 'translation',
          //   completeness: info.completeness,
          //   language: info.localName
          // });
        }
      }
      setLanguage(value as string);
    }
  }

  async function refreshThemes() {
    await invoke('refresh_themes');
    const themes = await invoke('get_themes');
    setThemes(themes as Theme[]);
    applyTheme((theme as string).toLowerCase());
  }

  return (
    <SettingsContext.Provider
      value={{
        keepLauncherOpen,
        animatePages,
        bannerTheme,
        themes,
        theme,
        language,
        setSetting,
        refreshThemes
      }}
    >
      <TranslationProvider translation={langs[language] ?? {}}>{children}</TranslationProvider>
    </SettingsContext.Provider>
  );
};
