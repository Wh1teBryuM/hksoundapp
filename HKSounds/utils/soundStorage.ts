import * as FileSystem from 'expo-file-system';

const SOUNDS_DIR = FileSystem.documentDirectory + 'sounds/';
const SOUNDS_JSON = FileSystem.documentDirectory + 'sounds.json';

export type SoundCategory = 'cantonese' | 'meme' | 'reaction' | 'movie' | 'situation';

export interface DynamicSound {
  id: string;
  label: string;
  labelEn: string;
  emoji: string;
  category: SoundCategory;
  filePath: string;
}

async function ensureSoundsDir() {
  const dirInfo = await FileSystem.getInfoAsync(SOUNDS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SOUNDS_DIR, { intermediates: true });
  }
}

export async function loadSounds(): Promise<DynamicSound[]> {
  try {
    const info = await FileSystem.getInfoAsync(SOUNDS_JSON);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(SOUNDS_JSON);
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSound(sound: DynamicSound): Promise<void> {
  const current = await loadSounds();
  const updated = [...current, sound];
  await FileSystem.writeAsStringAsync(SOUNDS_JSON, JSON.stringify(updated));
}

export async function deleteSound(id: string): Promise<void> {
  const current = await loadSounds();
  const target = current.find(s => s.id === id);
  if (target) {
    try {
      await FileSystem.deleteAsync(target.filePath, { idempotent: true });
    } catch {}
  }
  const updated = current.filter(s => s.id !== id);
  await FileSystem.writeAsStringAsync(SOUNDS_JSON, JSON.stringify(updated));
}

export async function copyMp3ToStorage(sourceUri: string, fileName: string): Promise<string> {
  await ensureSoundsDir();
  const destPath = SOUNDS_DIR + fileName;
  await FileSystem.copyAsync({ from: sourceUri, to: destPath });
  return destPath;
}