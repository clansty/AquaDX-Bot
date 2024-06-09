import { getRequestContext } from '@cloudflare/next-on-pages';
import { AquaApi } from '@clansty/maibot-clients';
import { BA_VE, PLATE_TYPE, PLATE_VER } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import PlateProgress from '@/app/plateProgress/components/PlateProgress';

// https://github.com/vercel/next.js/issues/53562
export const runtime = 'edge';

export default async ({ params }: { params: { tguid: string, type: string } }) => {
	let type = decodeURIComponent(params.type) as typeof PLATE_TYPE[number] | '';
	let ver: typeof PLATE_VER[number] | typeof BA_VE;
	if (type as any === BA_VE) {
		ver = BA_VE;
		type = '';
	} else {
		ver = type.substring(0, 1) as any;
		type = type.substring(1) as any;
		if (!(PLATE_VER.includes(ver as any) && PLATE_TYPE.includes(type as any))) notFound();
	}

	const env = getRequestContext().env as CloudflareEnv;
	const aquaUserId = Number(await env.KV.get(`bind:${params.tguid}`));
	if (!aquaUserId) {
		throw new Error('请先绑定用户');
	}
	const api = await AquaApi.create(env.KV, env.API_BASE, env.POWERON_TOKEN);
	const userMusic = await api.getUserMusic(aquaUserId);

	return <PlateProgress userMusic={userMusic} type={type} ver={ver} />;
}
