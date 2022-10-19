const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const dateNewsOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

export function formatDate(date: string, lang: string = 'en-US') {
  return new Date(date).toLocaleDateString(lang, dateOptions).replace(/^./, (firstChar) => firstChar.toUpperCase());
}

export function formatDateNews(date: string, lang: string = 'en-US') {
  return new Date(date).toLocaleDateString(lang, dateNewsOptions).replace(/^./, (firstChar) => firstChar.toUpperCase());
}

export function isDev() {
  return import.meta.env.DEV;
}

export function getOSName(os: string) {
  switch (os) {
    case 'win32':
    case 'windows':
      return 'Windows';
    case 'osx':
      return 'MacOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Unknown';
  }
}

export function displayTime(time: number) {
  const secs = (time / 1000) % 60;
  const min = (time / 1000 / 60) % 60;
  const hours = (time / 1000 / 60 / 60) % 24;
  const days = (time / 1000 / 60 / 60 / 24) % 365;
  const years = time / 1000 / 60 / 60 / 24 / 30 / 365;

  let str = '';

  if (years >= 1) {
    str += Math.floor(years) + 'y ';
  }

  if (days >= 1) {
    str += Math.floor(days) + 'd ';
  }

  if (hours >= 1) {
    str += Math.floor(hours) + 'h ';
  }

  if (min >= 1) {
    str += Math.floor(min) + 'm ';
  }

  if (secs >= 1) {
    str += Math.floor(secs) + 's';
  }

  return str.trim();
}

let cacheRndStr: string[] = [];
export function generateRandomStr(length = 20) {
  const gen = () => {
    const arr = new Uint8Array((length || 40) / 2);
    window.crypto.getRandomValues(arr);
    const dec2hex = (dec: number) => dec.toString(16).padStart(2, '0');
    return Array.from(arr, dec2hex).join('');
  };

  let res = gen();

  while (cacheRndStr.includes(res)) {
    res = gen();
  }

  return res;
}

(window as any).generateRandomStr = generateRandomStr;
