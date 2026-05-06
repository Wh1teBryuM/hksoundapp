export type SoundCategory = 'all' | 'cantonese' | 'meme' | 'reaction' | 'movie' | 'situation';

export const CATEGORIES: { key: SoundCategory; label: string }[] = [
  { key: 'all', label: '全部 (ALL)' },
  { key: 'cantonese', label: '粵語 (CANTO)' },
  { key: 'meme', label: 'MEME' },
  { key: 'reaction', label: 'REACTION' },
  { key: 'movie', label: '電影 (MOVIE)' },
  { key: 'situation', label: '情景 (SITUATION)' },
];