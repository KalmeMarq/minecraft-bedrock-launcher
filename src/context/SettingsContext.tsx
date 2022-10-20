import React, { createContext, useEffect, useState } from 'react';
import bannerWild from '../assets/banners/wild.jpg';
import bannerCavesCliffs2 from '../assets/banners/caves_cliffs_two.jpg';
import bannerCavesCliffs1 from '../assets/banners/caves_cliffs_one.jpg';
import bannerNether from '../assets/banners/nether.jpg';
import bannerBuzzyBees from '../assets/banners/buzzy_bees.jpg';
import bannerVillagerPillager from '../assets/banners/villager_pillager.jpg';
import bannerAquatic from '../assets/banners/aquatic.jpg';
import bannerTechnically from '../assets/banners/technically.jpg';
import bannerWorldColor from '../assets/banners/world_of_color.jpg';
import bannerExploration from '../assets/banners/exploration.jpg';
import bannerCombat from '../assets/banners/combat.jpg';
import bannerCatsPandas from '../assets/banners/cats_and_pandas.jpg';
import bannerEarlyLegacyConsole from '../assets/banners/early_console_era.jpg';
import bannerLateLegacyConsole from '../assets/banners/late_legacy_console.jpg';
import bannerMidLegacyConsole from '../assets/banners/mid_legacy_console.jpg';
import bannerBedrockMaster from '../assets/banners/bedrock_master.jpg';
import bannerBedrockStandard from '../assets/banners/bedrock_standard.jpg';
import bannerIndieDays from '../assets/banners/indie_days.jpg';
import bannerOriginal from '../assets/banners/original_image.jpg';
import bannerBedrockJava from '../assets/banners/bedrock_java.jpg';
import bannerBedrockJavaTechno from '../assets/banners/bedrock_java_technoblade.jpg';
import bannerPocket from '../assets/banners/pocket_edition.jpg';

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
    image: bannerWild
  },
  {
    label: 'Wild Update',
    value: 'wild',
    image: bannerWild
  },
  {
    label: 'Caves & Cliffs (Part 2)',
    value: 'caves-cliffs-part-two',
    image: bannerCavesCliffs2
  },
  {
    label: 'Caves & Cliffs (Part 1)',
    value: 'caves-cliffs-part-one',
    image: bannerCavesCliffs1
  },
  {
    label: 'Nether Update',
    value: 'nether',
    image: bannerNether
  },
  {
    label: 'Buzzy Bees Update',
    value: 'buzzy-bees',
    image: bannerBuzzyBees
  },
  {
    label: 'Villager & Pillager Update',
    value: 'villager-pillager',
    image: bannerVillagerPillager
  },
  {
    label: 'Update Aquatic',
    value: 'aquatic',
    image: bannerAquatic
  },
  {
    label: 'Technically Updated (Java)',
    value: 'technically-java',
    image: bannerTechnically
  },
  {
    label: 'World of Color Update (Java)',
    value: 'world-color-java',
    image: bannerWorldColor
  },
  {
    label: 'Exploration Update (Java)',
    value: 'exploration-java',
    image: bannerExploration
  },
  {
    label: 'Combat Update (Java)',
    value: 'combat-java',
    image: bannerCombat
  },
  {
    label: 'Cats & Pandas (Bedrock)',
    value: 'cats-pandas-bedrock',
    image: bannerCatsPandas
  },
  {
    label: 'Official Release (Bedrock)',
    value: 'official-release-bedrock',
    image: bannerPocket
  },
  {
    label: 'Bedrock & Java (Technoblade)',
    value: 'technoblade',
    image: bannerBedrockJavaTechno
  },
  {
    label: 'Bedrock & Java',
    value: 'bedrock-java',
    image: bannerBedrockJava
  },
  {
    label: 'Bedrock Edition Standard',
    value: 'bedrock-standard',
    image: bannerBedrockStandard
  },
  {
    label: 'Bedrock Edition Master',
    value: 'bedrock-master',
    image: bannerBedrockMaster
  },
  {
    label: 'Original Legacy Console Era',
    value: 'original-legacy-console',
    image: bannerEarlyLegacyConsole
  },
  {
    label: 'Mid Legacy Console Era',
    value: 'mid-legacy-console',
    image: bannerMidLegacyConsole
  },
  {
    label: 'Late Legacy Console Era',
    value: 'late-legacy-console',
    image: bannerLateLegacyConsole
  },
  {
    label: 'Indie Days',
    value: 'indie-days',
    image: bannerIndieDays
  },
  {
    label: 'Original',
    value: 'original',
    image: bannerOriginal
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
