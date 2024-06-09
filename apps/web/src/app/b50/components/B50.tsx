import { RatingListEntry, UserMusic, UserRating, Song, BUDDIES_LOGO } from '@clansty/maibot-types';
import React from 'react';
import B50Song from './B50Song';
import { computeRa, ratingAnalyse } from '@clansty/maibot-utils';
import DxRating from '@/components/DxRating';
import styles from './B50.module.css';

export default ({ rating, userMusic, username, avatar }: { rating: UserRating, userMusic: UserMusic[], username: string, avatar: string }) =>
	<div style={{ padding: '0 20px' }}>
		<div className={`${styles.b50Header} flex items-center p-20px gap-[10px_40px]`}>
			<div style={{ fontSize: '6em', textShadow: '1px 1px 2px #fff', marginTop: '-.1em' }}>
				{username}
			</div>
			<div className="text-5em"><DxRating score={rating.rating} /></div>
			<div className={`${styles.hideOnSmallScreen} grow`} />
			<img className={styles.hideOnSmallScreen} src={BUDDIES_LOGO} alt="" height={120} />
		</div>

		<RatingTable rating={rating.ratingList} userMusic={userMusic} title="旧版本 Best 35" />
		<RatingTable rating={rating.newRatingList} userMusic={userMusic} title="当前版本 Best 15" />
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
	averageMinMax[0] = Math.round(averageMinMax[0] / scores.length);

	return <div>
		<div className={styles.b50GridHeader} style={{ display: 'flex', alignItems: 'center', textShadow: '1px 1px 2px #fff', fontWeight: 500 }}>
			<div style={{ fontSize: '5em', flexGrow: 1 }}>{title}</div>
			<div style={{ fontSize: '2em', margin: '0 15px' }}>
				<div>平均: {ratingAnalyse(averageMinMax[0])}</div>
				<div>最低: {ratingAnalyse(averageMinMax[1])}</div>
				<div>最高: {ratingAnalyse(averageMinMax[2])}</div>
			</div>
		</div>
		<div className={styles.b50Grid}>
			{entries.map(it => <B50Song entry={it.rating} score={userMusic.find(music => music.musicId === it.rating.musicId)} key={it.rating.musicId} />)}
		</div>
	</div>;
};
