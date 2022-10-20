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

export const profileIcons = [
  'Birch_Log',
  'Birch_Planks',
  'Block_of_Coal',
  'Block_of_Diamond',
  'Block_of_Emerald',
  'Block_of_Gold',
  'Block_of_Iron',
  'Block_of_Netherite',
  'Block_of_Redstone',
  'Bookshelf',
  'Bricks',
  'Cake',
  'Chest',
  'Clay',
  'Coal_Ore',
  'Cobblestone',
  'Command_Block',
  'Copper_Block',
  'Copper_Ore',
  'Crafting_Table',
  'Creeper_Head',
  'Crimson_Planks',
  'Crimson_Stem',
  'Custom_BedrockGrass',
  'Custom_Package',
  'Dark_Oak_Leaves',
  'Dark_Oak_Log',
  'Dark_Oak_Planks',
  'Deepslate',
  'Deepslate_Coal_Ore',
  'Deepslate_Copper_Ore',
  'Deepslate_Diamond_Ore',
  'Deepslate_Emerald_Ore',
  'Deepslate_Gold_Ore',
  'Deepslate_Iron_Ore',
  'Deepslate_Lapis_Lazuli_Ore',
  'Deepslate_Redstone_Ore',
  'Diamond_Ore',
  'Diorite',
  'Dirt',
  'Emerald_Ore',
  'Enchanting_Table',
  'End_Stone',
  'Ender_Chest',
  'Exposed_Copper_Block',
  'Farmland',
  'Flowering_Azalea_Leaves',
  'Furnace',
  'Glass',
  'Glowstone',
  'Gold_Ore',
  'Granite',
  'Grass_Block',
  'Grass_Path',
  'Gravel',
  'Honey_Block',
  'Ice',
  'Iron_Ore',
  'Jungle_Leaves',
  'Jungle_Log',
  'Jungle_Planks',
  'Lapis_Lazuli_Ore',
  'Lectern_Book',
  'Light_Blue_Glazed_Terracotta',
  'Lit_Furnace',
  'Mangrove_Leaves',
  'Mangrove_Log',
  'Mangrove_Planks',
  'Mycelium',
  'Nether_Bricks',
  'Nether_Quartz_Ore',
  'Nether_Reactor_Core',
  'Nether_Reactor_Core_Finished',
  'Nether_Reactor_Core_Initialized',
  'Nether_Wart_Block',
  'Netherrack',
  'Oak_Leaves',
  'Oak_Log',
  'Oak_Planks',
  'Observer',
  'Obsidian',
  'Orange_Glazed_Terracotta',
  'Oxidized_Copper_Block',
  'Piston',
  'Podzol',
  'Pumpkin',
  'Red_Sand',
  'Red_Sandstone',
  'Redstone_Ore',
  'Sand',
  'Sandstone',
  'Skeleton_Skull',
  'Slime_Block',
  'Snow_Block',
  'Snowy_Grass_Block',
  'Soul_Sand',
  'Spruce_Leaves',
  'Spruce_Log',
  'Spruce_Planks',
  'Sticky_Piston',
  'Stone',
  'Terracotta',
  'TNT',
  'Tuff',
  'Warped_Planks',
  'Warped_Stem',
  'Warped_Wart_Block',
  'Water',
  'Weathered_Copper_Block',
  'White_Glazed_Terracotta',
  'White_Wool',
  'Xmas_Chest',
  'Acacia_Leaves',
  'Acacia_Log',
  'Acacia_Planks',
  'Ancient_Debris',
  'Andesite',
  'Azalea_Leaves',
  'Bedrock',
  'Birch_Leaves'
];
