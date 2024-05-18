import { ScoreRenderType, TableContentRenderData, TableContentRenderRow, UserMusic } from '../../types';
import React from 'react';
import convert from '../../convert';
import { IMG_DX, IMG_STD, LEVEL_COLOR, LEVEL_EN } from '../../consts';

const COVER_SIZE = '80px';
const BORDER_SIZE = '5px';
const SD_DX_SIZE = '50px';

export default ({ scoreType, data, showSdDx = true }: { scoreType: ScoreRenderType, data: TableContentRenderRow[], showSdDx?: boolean }) =>
	<div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
		{data.map(row => <Row data={row} scoreType={scoreType} key={row.levelValue} showSdDx={showSdDx} />)}
	</div>

const Row = ({ scoreType, data, showSdDx }: { scoreType: ScoreRenderType, data: TableContentRenderRow, showSdDx: boolean }) =>
	<div style={{ display: 'flex', gap: 10 }}>
		<div style={{ width: 100, flexShrink: 0, height: COVER_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 500, textShadow: '1px 1px 2px #fff' }}>
			{data.levelValue}
		</div>
		<div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: `repeat(15, ${COVER_SIZE})`, gridAutoRows: COVER_SIZE, gap: 10 }}>
			{data.data.map(it => <Cell scoreType={scoreType} data={it} key={it.song.id} showSdDx={showSdDx} />)}
		</div>
	</div>;

const Cell = ({ scoreType, data, showSdDx }: { scoreType: ScoreRenderType, data: TableContentRenderData, showSdDx: boolean }) =>
	<div style={{
		backgroundImage: `url(${data.song.coverUrl})`, height: '100%', width: '100%', backgroundSize: 'cover', position: 'relative',
		boxSizing: 'border-box', borderWidth: BORDER_SIZE, borderStyle: 'solid', borderColor: LEVEL_COLOR[LEVEL_EN.indexOf(data.chart.difficulty)]
	}}>
		{showSdDx && <img src={data.chart.type === 'dx' ? IMG_DX : IMG_STD} alt="" style={{ position: 'absolute', top: 1, left: 1, width: SD_DX_SIZE }} />}
		{data.score &&
			<div style={{ backgroundColor: 'rgba(0,0,0,0.8)', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>
				<DisplayScore scoreType={scoreType} score={data.score} />
			</div>}
	</div>;

const DisplayScore = ({ scoreType, score }: { scoreType: ScoreRenderType, score: UserMusic }) => {
	switch (scoreType) {
		case 'score':
			return `${(score.achievement / 1e4).toFixed(4)}%`;
		case 'rank':
			return <img src={convert.getRankImage(convert.achievementToRank(score.achievement))} alt="" width={COVER_SIZE} />;
	}
};
