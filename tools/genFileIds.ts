import * as fs from 'node:fs';
import { ALL_MUSIC } from '../src/consts';
import stripAnsi from 'strip-ansi';
import prodIds from '../src/data/fileIds-prod.json';
import devIds from '../src/data/fileIds-dev.json';

function parseJsonObjects(content: string): any[] {
	const lines: string[] = content.split('\n');
	let jsonString: string = '';
	const jsonObjects: object[] = [];
	let openBraces: number = 0;

	lines.forEach((line: string) => {
		line = line.trim();
		if (line) {
			jsonString += line;
			for (let char of line) {
				if (char === '{') openBraces++;
				if (char === '}') openBraces--;
			}

			if (openBraces === 0 && jsonString) {
				try {
					jsonObjects.push(JSON.parse(jsonString));
				} catch (e) {
					// console.error('Failed to parse JSON:', jsonString, e);
				}
				jsonString = '';
			} else if (openBraces < 0) {
				// Reset if braces go negative, indicating invalid JSON
				openBraces = 0;
				jsonString = '';
			}
		}
	});

	return jsonObjects;
}

const prodObjects = parseJsonObjects(fs.readFileSync('prod_files', 'utf-8'));
const devObjects = parseJsonObjects(stripAnsi(fs.readFileSync('dev_files', 'utf-8')));

console.log('prodObjects:', prodObjects.length);
console.log('devObjects:', devObjects.length);

const parseUpdate = (update: any, ids: Record<number, string>) => {
	const audio = update?.message?.audio;
	if (!audio) return;
	const title = audio.title;
	const fileId = audio.file_id;

	const song = Object.entries(ALL_MUSIC).find(([_, v]) => v.name === title);
	if (!song) {
		console.error('找不到:', title, fileId);
		return;
	}
	const id = Number(song[0]) % 1e4;
	ids[id] = fileId;
};

for (const devObject of devObjects) {
	parseUpdate(devObject, devIds);
}

for (const prodObject of prodObjects) {
	for (const log of prodObject.logs) {
		for (const message of log.message) {
			parseUpdate(message, prodIds);
		}
	}
}

fs.writeFileSync('fileIds-dev.json', JSON.stringify(devIds, null, 2));
fs.writeFileSync('fileIds-prod.json', JSON.stringify(prodIds, null, 2));
