import { Chart, DX_VERSIONS, IMG_DX, IMG_STD, LEVEL_COLOR, LEVEL_EN, Song } from '@clansty/maibot-types';
import _ from 'lodash';
import { notFound } from 'next/navigation';
import React from 'react';

export const dynamicParams = false;
export const generateStaticParams = () => Song.getAllIds().flatMap(id => [{ id: id.toString() }, { id: (id + 1e4).toString() }]);

export default ({ params }: { params: { id: string } }) => {
	const song = Song.fromId(Number(params.id));
	if (!song) notFound();

	return <div className="flex justify-center">
		<div className="w-full max-w-800px">
			<div className="flex flex-col md:flex-row items-center justify-center gap-4 m-y">
				<img src={song.coverUrl} alt="" className="w-full max-w-200px" />
				<div className="flex items-center gap-col-1 text-30px">
					<span className="c-gray-6">{song.id}</span>
					<span className="font-bold">{song.title}</span>
				</div>
			</div>
			<div className="m-y-8">
				<table className="border-spacing-1">
					<tbody>
					<tr>
						<td className="c-gray-6">作曲:</td>
						<td className="font-600">{song.artist}</td>
					</tr>
					<tr>
						<td className="c-gray-6">BPM:</td>
						<td className="font-600">{song.bpm}</td>
					</tr>
					<tr>
						<td className="c-gray-6">分类:</td>
						<td className="font-600">{song.category}</td>
					</tr>
					</tbody>
				</table>
				<ChartTypeView song={song} />
				<ChartTypeView song={song} dx />
			</div>
		</div>
	</div>;
}

const ChartTypeView = ({ song, dx }: { song: Song, dx?: boolean }) => {
	const chart = song.sheets.find(it => it.type === (dx ? 'dx' : 'std'));
	if (!chart) return;

	return <div className="m-y-8">
		<img src={dx ? IMG_DX : IMG_STD} alt="" height="30px" className="m-l-10px" />
		<table className="border-spacing-1">
			<tbody>
			<tr>
				<td className="c-gray-6">添加版本:</td>
				<td className="font-600">{chart.version}</td>
			</tr>
			<tr>
				<td className="c-gray-6">添加日期:</td>
				<td className="font-600">{chart.releaseDate}</td>
			</tr>
			<tr>
				<td className="c-gray-6">可玩区域:</td>
				<td>
					<div className="flex gap-1 items-center text-xl">
						{chart.regions.cn && <div className="i-twemoji-flag-china" />}
						{chart.regions.jp && <div className="i-twemoji-flag-japan" />}
						{chart.regions.intl && <div className="i-twemoji-world-map" />}
					</div>
				</td>
			</tr>
			</tbody>
		</table>
		{song.sheets.filter(it => it.type === (dx ? 'dx' : 'std')).map((it, index) => <ChartView key={index} chart={it} />)}
	</div>;
};

const ChartView = ({ chart }: { chart: Chart }) => {
	return <div className="m-y-6">
		<div className="m-l-10px flex gap-2 items-center">
			<span className="rounded-full p-x-2 leading-relaxed text-white inline-flex items-center font-bold shadow-[0.0625rem_0.125rem_0_0_#0b38714D]" style={{ backgroundColor: LEVEL_COLOR[LEVEL_EN.indexOf(chart.difficulty)] }}>
				{chart.difficulty.toUpperCase()}
			</span>
			<span className="font-600">{chart.internalLevelValue}</span>
			<span>{chart.noteDesigner}</span>
		</div>
		{chart.multiverInternalLevelValue && <div className="overflow-x-auto w-full">
			<table className="border-spacing-x-sm border-spacing-y-2">
				<tbody>
				<tr>
					{DX_VERSIONS.map((it, index) => chart.multiverInternalLevelValue[it] && <th key={index}>{it}</th>)}
				</tr>
				<tr>
					{DX_VERSIONS.map((it, index) => chart.multiverInternalLevelValue[it] && <td key={index} className="text-center">{chart.multiverInternalLevelValue[it]}</td>)}
				</tr>
				</tbody>
			</table>
		</div>}
		{chart.noteCounts && <table className="border-spacing-x-sm border-spacing-y-2">
			<tbody>
			<tr>
				{Object.keys(chart.noteCounts).map((it, index) => <th key={index}>{_.capitalize(it)}</th>)}
			</tr>
			<tr>
				{Object.values(chart.noteCounts).map((it, index) => <td key={index} className="text-center">{it}</td>)}
			</tr>
			</tbody>
		</table>}
	</div>;
};
