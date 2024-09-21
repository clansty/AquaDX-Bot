import { ALL_MUSIC } from '@clansty/maibot-data';
import { Song } from '@clansty/maibot-types';
import fsP from 'node:fs/promises';

for (const [id, content] of Object.entries(ALL_MUSIC)) {
	if (Number(id) > 1e5) continue;
	if (Number(id) % 1e4 > 2e3) continue;

	const song = Song.fromId(Number(id));
	if (!song) continue;

	for (let i = 0; i < 5; i++) {
		if (!content.notes[i]?.lv && song.getChart(i)?.internalLevelValue) {
			content.notes[i] = { lv: song.getChart(i)!.internalLevelValue };
			console.log(`Updated ${id} ${content.name} ${i + 1} to ${content.notes[i].lv}`);
		}
	}
}

await fsP.writeFile('./all-music.json', JSON.stringify(ALL_MUSIC, null, '\t'));
