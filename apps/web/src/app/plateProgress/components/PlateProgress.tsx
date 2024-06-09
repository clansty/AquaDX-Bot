import { BA_VE, BUDDIES_LOGO, MAIMAI_DX_RELEASE_DATE, PLATE_IMAGES, PLATE_TYPE, PLATE_VER, PLATE_VER_LIST, Song, VER_MUSIC_LIST, TableContentRenderData, TableContentRenderRow, UserMusic } from '@clansty/maibot-types';
import React from 'react';
import TableContent from '../../../components/TableContent';
import _ from 'lodash';
import LevelProgress from '../../../components/LevelProgress';
import { calcProgress } from '@clansty/maibot-utils';
import styles from './PlateProgress.module.css';

export default ({ userMusic, ver, type }: { userMusic: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '' }) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = PLATE_VER_LIST[ver].flatMap(ver => VER_MUSIC_LIST[ver]).map(id => Song.fromId(id));
	const levelsRequired = [3];
	// 只有舞x 和霸者需要打白谱
	if (ver === BA_VE || ver === '舞') levelsRequired.push(4);
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
		<div className={styles.header}>
			<img src={BUDDIES_LOGO} alt="" height={120} className={styles.hideOnSmallScreen} />
			<div style={{ flexGrow: 1 }} className={styles.hideOnSmallScreen} />
			{
				PLATE_IMAGES[ver + (type || '')] ?
					<img src={PLATE_IMAGES[ver + (type || '')]} alt="" height={80} /> :
					<div className={styles.title}>
						{ver}{type}
						<br/>
						完成进度
					</div>
			}
			<LevelProgress progress={calcProgress(userMusic, ver, type)} />
		</div>
		<TableContent data={displayDataRows} scoreType={['极', '神'].includes(type) ? 'combo' : 'rank'} showSdDx={false} />
	</div>;
}
