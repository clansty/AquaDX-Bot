import Song from '../models/Song';
import { InlineKeyboardButton } from 'telegraf/types';
import { TypeEnum } from '@gekichumai/dxdata';
import { LEVEL, LEVEL_EN } from '../consts';

export default (song: Song) => {
	const buttons = [] as InlineKeyboardButton[][];
	const stdCharts = song.sheets.filter(it => it.type === TypeEnum.STD);
	const dxCharts = song.sheets.filter(it => it.type === TypeEnum.DX);
	const haveBothCharts = stdCharts.length && dxCharts.length;
	if (stdCharts.length) {
		buttons.push(stdCharts.map(it => ({
			text: (haveBothCharts ? '标准 ' : '') + LEVEL[LEVEL_EN.indexOf(it.difficulty)],
			callback_data: `song:${song.id}:${LEVEL_EN.indexOf(it.difficulty)}`
		})));
	}
	if (dxCharts.length) {
		buttons.push(dxCharts.map(it => ({
			text: (haveBothCharts ? 'DX ' : '') + LEVEL[LEVEL_EN.indexOf(it.difficulty)],
			callback_data: `song:${song.id + 1e4}:${LEVEL_EN.indexOf(it.difficulty)}`
		})));
	}
	return buttons;
}