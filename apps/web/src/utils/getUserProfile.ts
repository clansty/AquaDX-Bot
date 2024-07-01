import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv, UserProfilesKVStorage } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import { UserProfile } from '@clansty/maibot-clients';

export default async (tguid: string, profile: string | number) => {
	const env = getRequestContext().env as CloudflareEnv;

	const profiles = await env.KV.get<UserProfilesKVStorage>(`profiles:${tguid}`, 'json');
	if (!profiles) notFound();
	const dto = profiles.profiles[profile];

	if (!dto) notFound();
	return await UserProfile.create(dto, env);
}
