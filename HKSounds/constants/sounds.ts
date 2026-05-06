export type SoundCategory = 'all' | 'cantonese' | 'meme' | 'reaction' | 'movie' | 'situation';

export interface Sound {
  id: string;
  label: string;
  labelEn: string;
  emoji: string;
  category: Exclude<SoundCategory, 'all'>;
  file: any;
}

export const CATEGORIES: { key: SoundCategory; label: string }[] = [
  { key: 'all', label: '全部 (ALL)' },
  { key: 'cantonese', label: '粵語 (CANTO)' },
  { key: 'meme', label: 'MEME' },
  { key: 'reaction', label: 'REACTION' },
  { key: 'movie', label: '電影 (MOVIE)' },
  { key: 'situation', label: '情景 (SITUATION)' },
];

export const SOUNDS: Sound[] = [
  {
    id: '1',
    label: '測試',
    labelEn: 'Test Sound',
    emoji: '🔊',
    category: 'cantonese',
    file: require('../assets/sounds/cantonese/test.mp3'),
  },
];