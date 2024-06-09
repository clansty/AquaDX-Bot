import { BUDDIES_LOGO, LEVEL_EN, LEVELS, Song, VersionEnum, ProgressCalcResult, TableContentRenderData, TableContentRenderRow, UserMusic } from '@clansty/maibot-types';
import React from 'react';
import TableContent from '../../../components/TableContent';
import _ from 'lodash';
import LevelProgress from '../../../components/LevelProgress';

export default ({ userMusic, level }: { userMusic: UserMusic[], level: typeof LEVELS[number] }) => {
	let displayData = [] as TableContentRenderData[];
	const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
	const progress = Array(5).fill(null).map(() => ({ all: 0, done: 0 })) as ProgressCalcResult[];
	// 用于计算是否全部 S 了之类的
	let userMaxScore = 101e4;
	for (const song of requiredSongList) {
		const charts = song.sheets.filter(chart => chart.level === level);
		for (const chart of charts) {
			// 不包括删除曲
			if (!chart.regions.jp) continue;
			// 不含 BUDDiES PLUS 的歌
			if (chart.version === VersionEnum.BUDDiESPLUS) continue;
			const score = userMusic.find(it => it.musicId === chart.internalId && it.level === LEVEL_EN.indexOf(chart.difficulty));
			progress[LEVEL_EN.indexOf(chart.difficulty)].all++;
			// TODO: 检查成绩，比如说 12 鸟加完成图
			if (score) {
				userMaxScore = Math.max(userMaxScore, score.achievement);
				progress[LEVEL_EN.indexOf(chart.difficulty)].done++;
			} else {
				userMaxScore = -1;
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
			<img src={BUDDIES_LOGO} alt="" height={120} />
			<div style={{ flexGrow: 1 }} />
			<div style={{ fontSize: 60, textShadow: '1px 1px 2px #fff', marginTop: '-.1em' }}>
				LV {level} {userMusic.length ? '完成进度' : '定数表'}
			</div>
			{!!userMusic.length && <LevelProgress progress={progress} />}
		</div>
		<TableContent data={displayDataRows} scoreType={'rank'} />
	</div>;
}
