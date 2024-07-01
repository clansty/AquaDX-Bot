import { AquaApi } from '@clansty/maibot-clients';
import Nameplate from '../../../../components/Nameplate';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@clansty/maibot-types';

export const runtime = 'edge';

export default async ({ params }: { params: { card: string } }) => {
	const env = getRequestContext().env as CloudflareEnv;
	const api = await AquaApi.create(env.KV, env.POWERON_TOKEN);
	const card = Number(params.card);
	const userData = await api.getUserData(card);
	return <div className="flex justify-center items-center h-50vh">
		<Nameplate user={userData}/>
	</div>;
}
