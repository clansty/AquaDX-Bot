import { RatingListEntry, UserMusic, UserRating, Song, BUDDIES_LOGO, Nameplate as NameplateData, UserCombinedRating } from '@clansty/maibot-types';
import React from 'react';
import B50Song from './B50Song';
import { computeRa, ratingAnalyse } from '@clansty/maibot-utils';
import styles from './B50.module.css';
import Nameplate from '@/components/Nameplate';

export default ({ rating, user }: { rating: UserCombinedRating, user: NameplateData }) =>
	<div style={{ padding: '0 20px' }}>
		<div className={`${styles.b50Header} flex items-center p-[20px_0] gap-[10px_40px]`}>
			<div className="text-1.8em">
				<Nameplate user={user} />
			</div>
			<div className={`${styles.hideOnSmallScreen} grow`} />
			<img className={styles.hideOnSmallScreen} src={BUDDIES_LOGO} alt="" height={120} />
		</div>

		<RatingTable rating={rating.best35} userMusic={rating.musicList} title="旧版本 Best 35" />
		<RatingTable rating={rating.best15} userMusic={rating.musicList} title="当前版本 Best 15" />
	</div>

const RatingTable = ({ rating, userMusic, title }: { rating: RatingListEntry[], userMusic: UserMusic[], title: string }) => {
	const scores = [] as number[];
	let entries = [] as { rating: RatingListEntry, score?: number }[];
	for (const ratingListEntry of rating) {
		const song = Song.fromId(ratingListEntry.musicId);
		const chart = song?.getChart(ratingListEntry.level);
		if (!chart) {
			entries.push({ rating: ratingListEntry });
			continue;
		}
		const score = computeRa(chart.internalLevelValue, ratingListEntry.achievement);
		scores.push(score);
		entries.push({ rating: ratingListEntry, score });
	}
	// 游戏给的排序没问题。要是顺序真的不对，那就是算法有问题，或者是数据有问题。
	// entries = _.sortBy(entries, it => -it.score || 1);
	const averageMinMax = scores.reduce((acc, cur) => [acc[0] + cur, Math.min(acc[1], cur), Math.max(acc[2], cur)], [0, Infinity, -Infinity]);
	const sum = averageMinMax[0];
	averageMinMax[0] = Math.round(sum / scores.length);

	return <div>
		<div className={styles.b50GridHeader} style={{ display: 'flex', alignItems: 'center', textShadow: '1px 1px 2px #fff', fontWeight: 500 }}>
			<div style={{ fontSize: '5em', flexGrow: 1 }}>
				{title}
				<div className="text-.4em">
					总分: <span className="font-600">{sum}</span>
					{![35, 15].includes(scores.length) && `（共 ${scores.length} 首）`}
				</div>
			</div>
			<div style={{ fontSize: '2em', margin: '0 15px' }}>
				<div>平均: {ratingAnalyse(averageMinMax[0])}</div>
				<div>最低: {ratingAnalyse(averageMinMax[1])}</div>
				<div>最高: {ratingAnalyse(averageMinMax[2])}</div>
			</div>
		</div>
		<div className={styles.b50Grid}>
			{entries.map(it => <B50Song entry={it.rating} score={userMusic.find(music => music.musicId === it.rating.musicId && music.level === it.rating.level)} key={it.rating.musicId} />)}
		</div>
	</div>;
};
