import { ALL_MUSIC } from '@clansty/maibot-data';
import { Song } from '@clansty/maibot-types';

const result = new Set<number>();
for (const id of Object.keys(ALL_MUSIC)) {
	const song = Song.fromId(Number(id));
	const chart = song.getChart('红', true);
	if (chart && chart.version === 'BUDDiES') {
		result.add(song.id % 1e4 + 1e4);
	}
}

console.log(Array.from(result));
