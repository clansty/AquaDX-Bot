import { ALL_MUSIC } from '@clansty/maibot-data';
import fsP from 'node:fs/promises';

const result = Object.fromEntries(Object.entries(ALL_MUSIC).filter(([id, content]) =>
	// 移除自制谱
	Number(id) % 1e4 < 2e3));

console.log(Object.keys(ALL_MUSIC).length, Object.keys(result).length);
await fsP.writeFile('./all-music.json', JSON.stringify(result, null, '\t'));
