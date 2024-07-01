import { getRequestContext } from '@cloudflare/next-on-pages';
import { AquaApi } from '@clansty/maibot-clients';
import LevelProgress from '../../components/LevelProgress';
import { LEVELS } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';

// https://github.com/vercel/next.js/issues/53562
export const runtime = 'edge';

export default async ({ params }: { params: { tguid: string, level: string } }) => {
	const level = decodeURIComponent(params.level) as typeof LEVELS[number];
	if (!LEVELS.includes(level)) notFound();

	const env = getRequestContext().env as CloudflareEnv;
	const aquaUserId = Number(await env.KV.get(`bind:${params.tguid}`));
	if (!aquaUserId) {
		throw new Error('请先绑定用户');
	}
	const api = await AquaApi.create(env.KV, env.POWERON_TOKEN);
	const userMusic = await api.getUserMusic(aquaUserId);

	return <LevelProgress userMusic={userMusic} level={level} />;
}
