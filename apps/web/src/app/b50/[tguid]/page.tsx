import { AquaApi } from '@clansty/maibot-clients';
import { getRequestContext } from '@cloudflare/next-on-pages';
import B50 from '@/app/b50/components/B50';

export const runtime = 'edge';

export default async ({ params }: { params: { tguid: string } }) => {
	const env = getRequestContext().env as CloudflareEnv;
	const aquaUserId = Number(await env.KV.get(`bind:${params.tguid}`));
	if (!aquaUserId) {
		throw new Error('请先绑定用户');
	}
	const api = await AquaApi.create(env.KV, env.API_BASE, env.POWERON_TOKEN);
	const userRating = await api.getUserRating(aquaUserId);
	const userMusic = await api.getUserMusic(aquaUserId);
	const userPreview = await api.getUserPreview(aquaUserId);

	return <B50 rating={userRating} userMusic={userMusic} avatar="" username={userPreview.userName} />;
}
