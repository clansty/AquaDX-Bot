import { getRequestContext } from '@cloudflare/next-on-pages';
import { AquaApi } from '@clansty/maibot-clients';
import LevelProgress from '../../../components/LevelProgress';
import { LEVELS } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';

// https://github.com/vercel/next.js/issues/53562
export const runtime = 'edge';

// 这里使用了 GhostCard 参数，不安全，不能把地址返回给用户，只能测试用
export default async ({ params }: { params: { card: string, level: string } }) => {
	const level = decodeURIComponent(params.level) as typeof LEVELS[number];
	if (!LEVELS.includes(level)) notFound();

	const env = getRequestContext().env as CloudflareEnv;
	const api = await AquaApi.create(env.KV, env.POWERON_TOKEN);
	const card = Number(params.card);
	const userMusic = await api.getUserMusic(card);
	return <LevelProgress userMusic={userMusic} level={level} />;
}
