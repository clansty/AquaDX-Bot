import fsP from 'node:fs/promises';

const dir = await fsP.readdir(process.argv[2]);
const ids = dir.map(v => v.split('.')[0]).map(Number);

await fsP.writeFile('./jacket-exist-ids.json', JSON.stringify(ids, null, '\t'));
