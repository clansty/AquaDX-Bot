import { BA_VE, BUDDIES_LOGO, MAIMAI_DX_RELEASE_DATE, PLATE_IMAGES, PLATE_TYPE, PLATE_VER, Song, TableContentRenderData, TableContentRenderRow, UserMusic } from '@clansty/maibot-types';
import React from 'react';
import TableContent from '../../../components/TableContent';
import _ from 'lodash';
import LevelProgress from '../../../components/LevelProgress';
import { calcProgress } from '@clansty/maibot-utils';
import styles from './PlateProgress.module.css';

export default ({ userMusic, ver, type, requiredList }: {
	userMusic: UserMusic[],
	ver: typeof PLATE_VER[number] | typeof BA_VE,
	type: typeof PLATE_TYPE[number] | '',
	requiredList: number[]
}) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = requiredList.map(id => Song.fromId(id));
	const levelsRequired = [3];
	// 只有舞x 和霸者需要打白谱
	if ([BA_VE, '舞', '全曲'].includes(ver) || ['clear', 'fc', 'ap'].includes(type)) levelsRequired.push(4);
	for (const song of requiredSongList) {
		for (const level of levelsRequired) {
			const chart = song.getChart(level);
			if (!chart) continue;
			if (type !== 'clear' && (ver === BA_VE || PLATE_VER.indexOf(ver) < PLATE_VER.indexOf('熊'))) {
				if (chart.releaseDate && new Date(chart.releaseDate) >= MAIMAI_DX_RELEASE_DATE) continue;
			}
			displayData.push({
				song,
				chart,
				score: userMusic.find(it => it.musicId === song.dxId && it.level === level)
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
		<div className={styles.header}>
			<img src={BUDDIES_LOGO} alt="" height={120} className={styles.hideOnSmallScreen} />
			<div style={{ flexGrow: 1 }} className={styles.hideOnSmallScreen} />
			{
				PLATE_IMAGES[ver + (type || '')] ?
					<img src={PLATE_IMAGES[ver + (type || '')]} alt="" height={80} /> :
					<div className={styles.title}>
						{ver}{type}
						<br />
						完成进度
					</div>
			}
			<LevelProgress progress={calcProgress(userMusic, ver, type, requiredList)} />
		</div>
		<TableContent data={displayDataRows} scoreType={['极', '神', 'fc', 'ap'].includes(type) ? 'combo' : type === 'clear' ? 'score' : 'rank'} showSdDx={ver === '全曲'} />
	</div>;
}
