import { RatingListEntry, UserMusic, UserRating } from '../types';
import React from 'react';
import B50Song from './components/B50Song';
import Song from '../models/Song';
import compute from '../compute';
import { BUDDIES_LOGO } from '../consts';
import convert from '../convert';

export default (rating: UserRating, userMusic: UserMusic[], username: string, avatar: string) =>
	<div style={{ padding: '0 20px' }}>
		<div style={{ display: 'flex', alignItems: 'center', padding: '20px 20px', gap: 40 }}>
			<img src={avatar} alt="" height={100} width={100} style={{ borderRadius: 10 }} />
			<div style={{ fontSize: 60, textShadow: '1px 1px 2px #fff', marginTop: '-.1em' }}>
				{username}
			</div>
			<div style={{ fontSize: 50 }}><DxRating score={rating.rating} /></div>
			<div style={{ flexGrow: 1 }} />
			<img src={BUDDIES_LOGO} alt="" height={120} />
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
		const score = compute.ra(chart.internalLevelValue, ratingListEntry.achievement);
		scores.push(score);
		entries.push({ rating: ratingListEntry, score });
	}
	// 游戏给的排序没问题。要是顺序真的不对，那就是算法有问题，或者是数据有问题。
	// entries = _.sortBy(entries, it => -it.score || 1);
	const averageMinMax = scores.reduce((acc, cur) => [acc[0] + cur, Math.min(acc[1], cur), Math.max(acc[2], cur)], [0, Infinity, -Infinity]);
	averageMinMax[0] = Math.round(averageMinMax[0] / scores.length);

	return <div>
		<div style={{ display: 'flex', alignItems: 'center', textShadow: '1px 1px 2px #fff', fontWeight: 500 }}>
			<div style={{ fontSize: 50, flexGrow: 1 }}>{title}</div>
			<div style={{ fontSize: 20, margin: '0 15px' }}>
				<div>平均: {compute.ratingAnalyse(averageMinMax[0])}</div>
				<div>最低: {compute.ratingAnalyse(averageMinMax[1])}</div>
				<div>最高: {compute.ratingAnalyse(averageMinMax[2])}</div>
			</div>
		</div>
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0 10px', margin: '15px 0' }}>
			{entries.map(it => <B50Song entry={it.rating} score={userMusic.find(music => music.musicId === it.rating.musicId)} key={it.rating.musicId} />)}
		</div>
	</div>;
};

const DxRating = ({ score }: { score: number }) => {
	return <div style={{ position: 'relative', display: 'inline-block' }}>
		<img src={convert.getDxRatingPlateImage(score)} alt="" style={{ height: '1.2em', verticalAlign: 'text-top' }} />
		<div style={{
			position: 'absolute', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', top: 0, bottom: 0, left: '47%', right: '14%',
			fontFamily: 'Reddit Mono', fontSize: '0.6em', fontWeight: 600, color: '#FCD41B'
		}}>
			{Array.apply(undefined, { length: 5 - score.toString().length }).map(() => <span />)}
			{score.toString().split('').map((digit, index) =>
				<span key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{digit}</span>)}
		</div>
	</div>;
};
