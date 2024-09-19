import { LEVEL, LEVEL_EN, Song, TypeEnum } from '@clansty/maibot-types';
import { MessageButton, MessageButtonCallback } from '@clansty/maibot-firm';

export default (song: Song) => {
	if (song.unlisted) return [];
	const buttons = [] as MessageButton[][];
	const stdCharts = song.sheets.filter(it => it.type === TypeEnum.STD);
	const dxCharts = song.sheets.filter(it => it.type === TypeEnum.DX);
	const haveBothCharts = stdCharts.length && dxCharts.length;
	if (stdCharts.length) {
		buttons.push(stdCharts.map(it => new MessageButtonCallback(
			(haveBothCharts ? '标准 ' : '') + LEVEL[LEVEL_EN.indexOf(it.difficulty)],
			`song:${song.id}:${LEVEL_EN.indexOf(it.difficulty)}`
		)));
	}
	if (dxCharts.length) {
		buttons.push(dxCharts.map(it => new MessageButtonCallback(
			(haveBothCharts ? 'DX ' : '') + LEVEL[LEVEL_EN.indexOf(it.difficulty)],
			`song:${song.id + 1e4}:${LEVEL_EN.indexOf(it.difficulty)}`
		)));
	}
	if (song.searchAcronyms?.length) {
		buttons.push([
			new MessageButtonCallback(
				'查看别名',
				`song:${song.id}:alias`
			)]);
	}
	return buttons;
}
