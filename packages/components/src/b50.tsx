import { RatingListEntry, UserMusic, UserRating, Song, BUDDIES_LOGO } from '@clansty/maibot-types';
import React from 'react';
import B50Song from './components/B50Song';
import { computeRa, ratingAnalyse } from '@clansty/maibot-utils';
import { getDxRatingPlateImage } from './urls';
import toDBC from './utils/toDBC';

export default (rating: UserRating, userMusic: UserMusic[], username: string, avatar: string, link = (song: Song) => undefined as string) =>
	<div style={{ padding: '0 20px' }}>
		<style>{`
			.hideOnSmallScreen {
			  @media (max-width: 1000px) {
			    display: none;
			  }
			}
			.b50Header {
				font-size: 10px;
			
			  @media (max-width: 650px) {
					font-size: 8px;
			  }
			  @media (max-width: 500px) {
					font-size: 7px;
			  }
			  @media (max-width: 450px) {
					font-size: 5.8px;
			  }
			}
		`}</style>
		<div className="b50Header" style={{ display: 'flex', alignItems: 'center', padding: '20px 20px', gap: '10px 40px' }}>
			{avatar && <img src={avatar} alt="" height={100} width={100} style={{ borderRadius: 10 }} className="hideOnSmallScreen" />}
			<div style={{ fontSize: '6em', textShadow: '1px 1px 2px #fff', marginTop: '-.1em' }}>
				{toDBC(username)}
			</div>
			<div style={{ fontSize: '5em' }}><DxRating score={rating.rating} /></div>
			<div className="hideOnSmallScreen" style={{ flexGrow: 1 }} />
			<img className="hideOnSmallScreen" src={BUDDIES_LOGO} alt="" height={120} />
		</div>

		<RatingTable rating={rating.ratingList} userMusic={userMusic} title="旧版本 Best 35" link={link} />
		<RatingTable rating={rating.newRatingList} userMusic={userMusic} title="当前版本 Best 15" link={link} />
	</div>

const RatingTable = ({ rating, userMusic, title, link }: { rating: RatingListEntry[], userMusic: UserMusic[], title: string, link: (song: Song) => string }) => {
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
		<style>{`
			.b50Grid {
			  display: grid; 
			  gap: 0 10px;
			  margin: 15px 0;
			  
			  @media (max-width: 765px) {
			    zoom: 90%
			  }
			  @media (min-width: 700px) {
			    grid-template-columns: repeat(2, 1fr);
			  }
			  @media (min-width: 1200px) {
			    grid-template-columns: repeat(3, 1fr);
			  }
			  @media (min-width: 1600px) {
			    grid-template-columns: repeat(4, 1fr);
			  }
			  @media (min-width: 1960px) {
			    grid-template-columns: repeat(5, 1fr);
			  }
			}
			
			.b50GridHeader {
			  font-size: 10px;
			  
			  @media (max-width: 800px) {
			    flex-direction: column;
			    gap: 10px;
			  }
			  @media (max-width: 700px) {
					font-size: 9px;
			  }
			  @media (max-width: 600px) {
					font-size: 8px;
			  }
			}
		`}</style>
		<div className="b50GridHeader" style={{ display: 'flex', alignItems: 'center', textShadow: '1px 1px 2px #fff', fontWeight: 500 }}>
			<div style={{ fontSize: '5em', flexGrow: 1 }}>{title}</div>
			<div style={{ fontSize: '2em', margin: '0 15px' }}>
				<div>平均: {ratingAnalyse(averageMinMax[0])}</div>
				<div>最低: {ratingAnalyse(averageMinMax[1])}</div>
				<div>最高: {ratingAnalyse(averageMinMax[2])}</div>
			</div>
		</div>
		<div className="b50Grid">
			{entries.map(it => <B50Song entry={it.rating} score={userMusic.find(music => music.musicId === it.rating.musicId)} link={link} key={it.rating.musicId} />)}
		</div>
	</div>;
};

const DxRating = ({ score }: { score: number }) => {
	return <div style={{ position: 'relative', display: 'inline-block' }}>
		<img src={getDxRatingPlateImage(score)} alt="" style={{ height: '1.2em', verticalAlign: 'text-top' }} />
		<div style={{
			position: 'absolute', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', top: 0, bottom: 0, left: '47%', right: '14%',
			fontFamily: 'var(--font-reddit-mono), Reddit Mono', fontSize: '0.6em', fontWeight: 600, color: '#FCD41B'
		}}>
			{Array.apply(undefined, { length: 5 - score.toString().length }).map(() => <span />)}
			{score.toString().split('').map((digit, index) =>
				<span key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{digit}</span>)}
		</div>
	</div>;
};
