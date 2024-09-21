import allMusic from './all-music.json';
import allMusic140 from './all-music-140.json';
import jacketExistIds from './jacket-exist-ids.json';

export const ALL_MUSIC = allMusic as Record<string | number, Partial<typeof allMusic[8]>>;
export const ALL_MUSIC_140 = allMusic140 as Record<string | number, Partial<typeof allMusic[8]>>;
export const JACKET_EXIST_IDS = jacketExistIds as number[];
