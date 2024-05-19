import { TableContentRenderData, TableContentRenderRow, UserMusic } from '../types';
import { BA_VE, BUDDIED_LOGO, MAIMAI_DX_RELEASE_DATE, PLATE_IMAGES, PLATE_VER_LIST, VER_MUSIC_LIST } from '../consts';
import Song from '../models/Song';
import React from 'react';
import TableContent from './components/TableContent';
import _ from 'lodash';
import compute from '../compute';
import LevelProgress from './components/LevelProgress';

export default (userMusic: UserMusic[]) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = PLATE_VER_LIST[BA_VE].flatMap(ver => VER_MUSIC_LIST[ver]).map(id => Song.fromId(id));
	for (const song of requiredSongList) {
		for (const level of [3, 4]) {
			const chart = song.getChart(level, false);
			if (!chart) continue;
			if (chart.releaseDate && new Date(chart.releaseDate) >= MAIMAI_DX_RELEASE_DATE) continue;
			displayData.push({
				song,
				chart,
				score: userMusic.find(it => it.musicId === song.id && it.level === level)
			});
		}
	}
	displayData = _.orderBy(displayData, it => it.chart.internalLevelValue, 'desc');
	const displayDataRows = _.orderBy(Object.entries(
		_.groupBy(displayData, it => {
			const floorValue = Math.floor(it.chart.internalLevelValue);
			if ([14, 13].includes(floorValue)) return it.chart.level;
			return floorValue;
		}))
		.map(([levelValue, data]) => ({
			levelValue,
			data
		} as TableContentRenderRow)), it => it.levelValue, 'desc');

	return <div>
		<div style={{ display: 'flex', alignItems: 'center', padding: 40, gap: 50 }}>
			<img src={BUDDIED_LOGO} alt="" height={120} />
			<div style={{ flexGrow: 1 }} />
			<img src={PLATE_IMAGES[BA_VE]} alt="" height={80} />
			<LevelProgress progress={compute.calcProgress(userMusic, BA_VE)} />
		</div>
		<TableContent data={displayDataRows} scoreType={'rank'} showSdDx={false} />
	</div>;
}
