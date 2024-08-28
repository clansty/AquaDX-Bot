import { ALL_MUSIC } from '@clansty/maibot-data';
import fs from 'node:fs';
import fsP from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const data = ALL_MUSIC;
const baseDir = process.argv[2];
const parser = new XMLParser();
const skipWhenExist = process.argv[3] === 'skip';

for (const f of await fsP.readdir(baseDir)) {
	if (!f.startsWith('music')) continue;
	if (!fs.existsSync(path.join(baseDir, f, 'Music.xml'))) continue;

	const meta = parser.parse(await fsP.readFile(path.join(baseDir, f, 'Music.xml'), 'utf-8'));
	let music: typeof ALL_MUSIC[8] = {};
	if (data[meta.MusicData.name.id]) {
		if (skipWhenExist)
			continue;
		music = data[meta.MusicData.name.id];
	} else {
		data[meta.MusicData.name.id] = music;
	}

	music.name = meta.MusicData.name.str.toString();
	console.log(music.name);
	music.ver = meta.MusicData.version.toString();
	music.composer = meta.MusicData.artistName.str.toString();
	music.genre = meta.MusicData.genreName.str.toString();

	music.notes = [];
	for (let i = 0; i < 5; i++) {
		music.notes.push({
			lv: Number.parseFloat(`${meta.MusicData.notesData.Notes[i].level}.${meta.MusicData.notesData.Notes[i].levelDecimal}`)
		});
	}
	for (let i = music.notes.length - 1; i > -1; i--) {
		if (!music.notes[i].lv) music.notes.pop();
		else break;
	}
}

await fsP.writeFile('./all-music.json', JSON.stringify(data, null, '\t'));
