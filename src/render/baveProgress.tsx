import { TableContentRenderData, TableContentRenderRow, UserMusic } from '../types';
import { BA_VE, BUDDIED_LOGO, LEVEL_COLOR, PLATE_IMAGES, PLATE_VER_LIST, VER_MUSIC_LIST } from '../consts';
import Song from '../data/Song';
import React from 'react';
import TableContent from './components/TableContent';
import _ from 'lodash';
import compute from '../compute';
import DifficultyTag from './components/DifficultyTag';
import ProgressBar from './components/ProgressBar';

export default (userMusic: UserMusic[]) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = PLATE_VER_LIST[BA_VE].flatMap(ver => VER_MUSIC_LIST[ver]).map(id => Song.fromId(id));
	for (const song of requiredSongList) {
		for (const level of [3, 4]) {
			const chart = song.getChart(level, false);
			if (!chart) continue;
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
			if (floorValue === 14) return it.chart.level;
			return floorValue;
		}))
		.map(([levelValue, data]) => ({
			levelValue,
			data
		} as TableContentRenderRow)), it => it.levelValue, 'desc');

	const progress = compute.calcProgress(userMusic, BA_VE);
	const totalProgress = progress.pop();
	return <div>
		<div style={{ display: 'flex', alignItems: 'center', padding: 40, gap: 50 }}>
			<img src={BUDDIED_LOGO} alt="" height={120} />
			<div style={{ flexGrow: 1 }} />
			<img src={PLATE_IMAGES[BA_VE]} alt="" height={80} />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
				{progress.map((it, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 250px auto', gap: 10, alignItems: 'center', fontWeight: 600 }}>
					<DifficultyTag level={i} />
					<ProgressBar color={LEVEL_COLOR[i]} progress={it.done / it.all} />
					<div style={{ marginTop: '-.1em', fontSize: 22 }}>{it.done}/{it.all}</div>
				</div>)}
			</div>
		</div>
		<TableContent data={displayDataRows} scoreType={'rank'} showSdDx={false} />
	</div>;
}
