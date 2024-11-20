import { UserProfile } from '@clansty/maibot-clients';

export default async (usernameEncoded: string) => {
	return await UserProfile.create({
		type: 'AquaDX-v2',
		username: decodeURIComponent(usernameEncoded),
	});
}
