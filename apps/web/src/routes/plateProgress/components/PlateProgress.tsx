import { BA_VE, MAIMAI_DX_RELEASE_DATE, PLATE_IMAGES, PLATE_TYPE, PLATE_VER, Song, TableContentRenderData, TableContentRenderRow, UserMusic } from '@clansty/maibot-types';
import TableContent from '../../../components/TableContent';
import _ from 'lodash';
import LevelProgress from '../../../components/LevelProgress';
import { calcProgress } from '@clansty/maibot-utils';
import styles from './PlateProgress.module.css';

export default ({ userMusic, ver, type, requiredList, logo }: {
	userMusic: UserMusic[],
	ver: typeof PLATE_VER[number] | typeof BA_VE,
	type: typeof PLATE_TYPE[number] | '',
	requiredList: Song[],
	logo: string,
}) => {
	let displayData = [] as TableContentRenderData[];
	const levelsRequired = [3];
	// 只有舞x 和霸者需要打白谱
	if ([BA_VE, '舞', '全曲'].includes(ver) || ['clear', 'fc', 'ap'].includes(type)) levelsRequired.push(4);
	for (const song of requiredList) {
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
		<div class={`${styles.header} flex items-center p-40px gap-50px`}>
			<img src={logo} alt="" height={120} class={styles.hideOnSmallScreen} />
			<div style={{ flexGrow: 1 }} class={styles.hideOnSmallScreen} />
			{
				PLATE_IMAGES[ver + (type || '') as keyof typeof PLATE_IMAGES] ?
					<img src={PLATE_IMAGES[ver + (type || '') as keyof typeof PLATE_IMAGES]} alt="" height={80} /> :
					<div class={`${styles.title} text-50px m-t--.1em text-shadow-[1px_1px_2px_#fff]`}>
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
