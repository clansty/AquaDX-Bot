import { ALL_MUSIC } from '@clansty/maibot-data';
import { Song } from '@clansty/maibot-types';

const result = new Set<number>();
for (const id of Object.keys(ALL_MUSIC)) {
	const song = Song.fromId(Number(id));
}

console.log(Array.from(result));
