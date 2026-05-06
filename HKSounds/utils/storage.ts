import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVOURITES_KEY = 'hksounds_favourites';
const SETTINGS_KEY = 'hksounds_settings';

export interface Settings {
  showEnglishLabel: boolean;
  stopOnSecondTap: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  showEnglishLabel: true,
  stopOnSecondTap: true,
};

export async function getFavourites(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(FAVOURITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFavourites(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
  } catch {}
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}