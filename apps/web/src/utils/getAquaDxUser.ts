import { UserProfile } from '@clansty/maibot-clients';

export default async (username: string) => {
	return await UserProfile.create({
		type: 'AquaDX-v2',
		username
	}, null);
}
