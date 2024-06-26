import allMusic from './all-music.json';
import fileIdsDev from './fileIds-dev.json';
import fileIdsProd from './fileIds-prod.json';

export const ALL_MUSIC = allMusic as Record<string | number, Partial<typeof allMusic[8]>>;
export const TG_MUSIC_IDS = (process.env.NODE_ENV === 'development' ? fileIdsDev : fileIdsProd) as Record<string | number, string>;
