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
    label: '測試一',
    labelEn: 'Test 1',
    emoji: '🔊',
    category: 'cantonese',
    file: require('../assets/sounds/cantonese/test.mp3'),
  },
  {
    id: '2',
    label: '測試二',
    labelEn: 'Test 2',
    emoji: '🗣️',
    category: 'cantonese',
    file: require('../assets/sounds/cantonese/test2.mp3'),
  },
  {
    id: '3',
    label: 'Bruh',
    labelEn: 'Bruh',
    emoji: '😐',
    category: 'meme',
    file: require('../assets/sounds/meme/test3.mp3'),
  },
  {
    id: '4',
    label: '電影',
    labelEn: 'Movie',
    emoji: '🎬',
    category: 'movie',
    file: require('../assets/sounds/movie/test4.mp3'),
  },
  {
    id: '5',
    label: '反應',
    labelEn: 'Reaction',
    emoji: '😱',
    category: 'reaction',
    file: require('../assets/sounds/reaction/test5.mp3'),
  },
  {
    id: '6',
    label: '情景',
    labelEn: 'Situation',
    emoji: '🎭',
    category: 'situation',
    file: require('../assets/sounds/situation/test6.mp3'),
  },
];