import { Nameplate } from '@clansty/maibot-types';
import React from 'react';
import DxRating from '@/components/DxRating';
import { Kosugi_Maru } from 'next/font/google';
import titles from '../data/titles.json';
import Title from '@/components/Title';
import { ASSET_TYPE, getAssetUrl } from '@clansty/maibot-utils/src/getAssetUrl';

const pad = (id: number) => id.toString().padStart(6, '0');
const pad2 = (id: number) => id.toString().padStart(2, '0');
const icon = (id: number) => getAssetUrl(ASSET_TYPE.Icon, id);
const frame = (id: number) => getAssetUrl(ASSET_TYPE.Frame, id);
const plate = (id: number) => getAssetUrl(ASSET_TYPE.Plate, id);
const classRank = (id: number) => getAssetUrl(ASSET_TYPE.Base, `UI_FBR_Class_${pad2(id)}`);
const course = (id: number) => getAssetUrl(ASSET_TYPE.Base, `UI_DNM_DaniPlate_${pad2(id)}`);

const kosugiMaru = Kosugi_Maru({ subsets: ['latin'], weight: '400' });


export default ({ user }: { user: Nameplate }) => {
	const title = titles.find(it => it.id === pad(user.titleId));

	return <div className="w-40em h-6.44em bg-cover flex" style={{ backgroundImage: `url(${plate(user.plateId)})` }}>
		<div className="p-.4em shrink-0 m-l-.1em">
			<img src={icon(user.iconId)} alt="" className="h-full" />
		</div>
		<div className="flex flex-col w-15em m-y-.4em m-l--.2em relative">
			<img src={classRank(user.classRank)} className="h-3.6em absolute right--.3em top--1.4em" />
			<div className="text-1.5em m-l--.04em">
				<DxRating score={user.playerRating} />
			</div>
			<div className={`bg-white rounded-.2em border-gray-4 border-solid border-1 ${kosugiMaru.className} text-1.2em p-l-.2em line-height-1.7em flex`}>
				<div className="grow-1">
					{user.userName}
				</div>
				<img src={course(user.courseRank)} className="shrink-0 h-1.7em" />
			</div>
			<div className="p-t-.15em text-.9em">
				<Title name={title?.name.toString() ?? '???'} rare={title?.rare ?? 'Normal'} />
			</div>
		</div>
	</div>;
}
