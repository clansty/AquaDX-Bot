import { CloudflareKvAdapter, Env, UserProfilesKVStorage } from '@clansty/maibot-types';
import { UserProfile } from '@clansty/maibot-clients';

const notFound = () => {
	throw new Error('Not found');
};

export default async (tguid: string, profile: string | number, env_: any) => {
	const env = env_ as Env;
	env.KV = new CloudflareKvAdapter(env.KV as any);

	const profiles = await env.KV.get<UserProfilesKVStorage>(`profiles:${tguid}`);
	if (!profiles) notFound();
	const dto = profiles!.profiles[profile as any];

	if (!dto) notFound();
	return await UserProfile.create(dto, env);
}
