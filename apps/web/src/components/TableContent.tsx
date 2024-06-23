import { Rank, ScoreRenderType, TableContentRenderData, TableContentRenderRow, UserMusic } from '@clansty/maibot-types';
import React from 'react';
import { IMG_DX, IMG_MOON_CAKE, IMG_STD, LEVEL_COLOR, LEVEL_EN } from '@clansty/maibot-types';
import { achievementToRank } from '@clansty/maibot-utils';
import Link from 'next/link';

const getRankImage = (rank: Rank): string => {
	return `https://shama.dxrating.net/images/rank/buddies-plus/${rank}.png`;
};

const COVER_SIZE = '80px';
const BORDER_SIZE = '5px';
const SD_DX_SIZE = '50px';

export default ({ scoreType, data, showSdDx = true }: { scoreType: ScoreRenderType, data: TableContentRenderRow[], showSdDx?: boolean }) =>
	<div className="flex flex-col gap-15px">
		{data.map(row => <Row data={row} scoreType={scoreType} key={row.levelValue} showSdDx={showSdDx} />)}
	</div>

const Row = ({ scoreType, data, showSdDx }: { scoreType: ScoreRenderType, data: TableContentRenderRow, showSdDx: boolean }) =>
	<div className="flex gap-10px">
		<div style={{ width: 100, flexShrink: 0, height: COVER_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 500, textShadow: '1px 1px 2px #fff' }}>
			{data.levelValue}
		</div>
		<div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${COVER_SIZE})`, gridAutoRows: COVER_SIZE, gap: 10 }}>
			{data.data.map(it => <Cell scoreType={scoreType} data={it} key={it.song.id} showSdDx={showSdDx} />)}
		</div>
	</div>;

const Cell = ({ scoreType, data, showSdDx }: { scoreType: ScoreRenderType, data: TableContentRenderData, showSdDx: boolean }) =>
	<Link href={`/song/byId/${data.song.id}`}>
		<div style={{
			backgroundImage: `url(${data.song.coverUrl})`, height: '100%', width: '100%', backgroundSize: 'cover', position: 'relative',
			boxSizing: 'border-box', borderWidth: BORDER_SIZE, borderStyle: 'solid', borderColor: LEVEL_COLOR[LEVEL_EN.indexOf(data.chart.difficulty)]
		}}>
			{showSdDx && <img src={data.chart.type === 'dx' ? IMG_DX : IMG_STD} alt="" style={{ position: 'absolute', top: 1, left: 1, width: SD_DX_SIZE }} />}
			{data.score && !(scoreType === 'combo' && !data.score.comboStatus) &&
				<div style={{ backgroundColor: 'rgba(0,0,0,0.7)', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>
					<DisplayScore scoreType={scoreType} score={data.score} />
				</div>}
		</div>
	</Link>;

const DisplayScore = ({ scoreType, score }: { scoreType: ScoreRenderType, score: UserMusic }) => {
	switch (scoreType) {
		case 'score':
			return `${(score.achievement / 1e4).toFixed(4)}%`;
		case 'rank':
			return <img src={getRankImage(achievementToRank(score.achievement))} alt="" width={COVER_SIZE} />;
		case 'combo':
			if (!score.comboStatus) return;
			return <img src={IMG_MOON_CAKE[score.comboStatus]} alt="" width={COVER_SIZE} />;
	}
};
