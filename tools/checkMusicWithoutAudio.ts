import { ALL_MUSIC } from '../src/consts';
import devIds from '../src/data/fileIds-dev.json';

let total = 0;
for (const [strId, info] of Object.entries(ALL_MUSIC)) {
	const id = Number(strId);
	if (devIds[id % 1e4]) continue;
	if (id > 1e5) continue;
	console.log(id, info.name);
	total++;
}

console.log('Total:', total);
