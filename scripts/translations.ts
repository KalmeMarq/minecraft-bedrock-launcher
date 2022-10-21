import languages from './languages.json' assert { type: 'json' };

const translations: {
  available_codes: string[];
  languages: {
    iso: string;
    locale: string;
    localName: string;
    completeness: number;
    direction: 'ltr' | 'rtl';
  }[];
} = {
  available_codes: [],
  languages: []
};

const enUSData: { [key: string]: string } = JSON.parse(Deno.readTextFileSync(`src/assets/translations/en-US.json`));
const translationsAmount = Object.keys(enUSData).length;

for await (const file of Deno.readDir('src/assets/translations')) {
  if (file.isFile && file.name.endsWith('.json')) {
    const code = file.name.replace('.json', '');

    translations.available_codes.push(file.name.replace('.json', ''));

    if (code !== 'en-US') {
      const data: { [key: string]: string } = { ...enUSData, ...JSON.parse(Deno.readTextFileSync(`src/assets/translations/${file.name}`)) };

      const lang = languages.find((c) => c.locale === code);

      if (!lang) throw new Error('Code ' + code + ' not found');

      let translated = 0;

      for (const [key, value] of Object.entries(data)) {
        if (key !== value && value !== '') {
          ++translated;
        }
      }

      translations.languages.push({
        iso: lang.iso,
        locale: lang.locale,
        localName: lang.localName,
        completeness: Math.floor(translationsAmount === 0 ? 100 : (translated / translationsAmount) * 100),
        direction: (lang as { direction?: 'ltr' | 'rtl' }).direction ?? 'ltr'
      });
    } else {
      const enUS = languages.find((c) => c.locale === 'en-US')!;

      translations.languages.push({
        iso: enUS.iso,
        locale: enUS.locale,
        localName: enUS.localName,
        completeness: 100,
        direction: 'ltr'
      });
    }
  }
}

Deno.writeTextFileSync('src/assets/translations.json', JSON.stringify(translations, null, 2));
