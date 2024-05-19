import { ProgressCalcResult, TableContentRenderData, TableContentRenderRow, UserMusic } from '../types';
import { BA_VE, BUDDIED_LOGO, LEVEL_EN, LEVELS, MAIMAI_DX_RELEASE_DATE, PLATE_IMAGES, PLATE_VER_LIST, VER_MUSIC_LIST } from '../consts';
import Song from '../data/Song';
import React from 'react';
import TableContent from './components/TableContent';
import _ from 'lodash';
import compute from '../compute';
import LevelProgress from './components/LevelProgress';

export default (userMusic: UserMusic[], level: typeof LEVELS[number]) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
	const progress = Array(5).fill(null).map(() => ({ all: 0, done: 0 })) as ProgressCalcResult[];
	for (const song of requiredSongList) {
		const charts = song.sheets.filter(chart => chart.level === level);
		for (const chart of charts) {
			const score = userMusic.find(it => it.musicId === chart.internalId && it.level === LEVEL_EN.indexOf(chart.difficulty));
			progress[LEVEL_EN.indexOf(chart.difficulty)].all++;
			// TODO: 检查成绩，比如说 12 鸟加完成图
			if (score) {
				progress[LEVEL_EN.indexOf(chart.difficulty)].done++;
			}
			displayData.push({
				song,
				chart,
				score
			});
		}
	}
	const displayDataRows = _.orderBy(Object.entries(
		_.groupBy(displayData, it => it.chart.internalLevelValue.toFixed(1)))
		.map(([levelValue, data]) => ({
			levelValue,
			data
		} as TableContentRenderRow)), it => it.levelValue, 'desc');

	return <div>
		<div style={{ display: 'flex', alignItems: 'center', padding: 40, gap: 50 }}>
			<img src={BUDDIED_LOGO} alt="" height={120} />
			<div style={{ flexGrow: 1 }} />
			<div style={{ fontSize: 60, textShadow: '1px 1px 2px #fff' }}>
				LV {level} 完成进度
			</div>
			<LevelProgress progress={progress} />
		</div>
		<TableContent data={displayDataRows} scoreType={'rank'} />
	</div>;
}
