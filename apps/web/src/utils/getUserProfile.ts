import { getCloudflareContext } from '@opennextjs/cloudflare';
import { CloudflareKvAdapter, Env, UserProfilesKVStorage } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import { UserProfile } from '@clansty/maibot-clients';

export default async (tguid: string, profile: string | number) => {
	const { env } = await getCloudflareContext() as unknown as { env: Env };
	env.KV = new CloudflareKvAdapter(env.KV as any);

	const profiles = await env.KV.get<UserProfilesKVStorage>(`profiles:${tguid}`);
	if (!profiles) notFound();
	const dto = profiles.profiles[profile];

	if (!dto) notFound();
	return await UserProfile.create(dto, env);
}
