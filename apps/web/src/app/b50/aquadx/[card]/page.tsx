import { b50 } from '@clansty/maibot-components';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { AquaApi } from '@clansty/maibot-clients';

// https://github.com/vercel/next.js/issues/53562
export const runtime = 'edge'

// 这里使用了 GhostCard 参数，不安全，不能把地址返回给用户，只能测试用
export default async ({ params }: { params: { card: string } }) => {
	const env = getRequestContext().env as CloudflareEnv;
	const api = await AquaApi.create(env.KV, env.API_BASE, env.POWERON_TOKEN);
	const card = Number(params.card);
	const userRating = await api.getUserRating(card);
	const userMusic = await api.getUserMusic(card);
	const userPreview = await api.getUserPreview(card);
	return b50(userRating, userMusic, userPreview.userName, '');
}
