import B50 from '@/app/b50/components/B50';
import getUserProfile from '@/utils/getUserProfile';

export const runtime = 'edge';

export default async ({ params }: { params: { tguid: string, profile: string } }) => {
	const profile = await getUserProfile(params.tguid, params.profile);
	const userRating = await profile.getUserRating();
	const userData = await profile.getNameplate();
	const profileVer = await profile.getVersion();

	return <B50 rating={userRating} user={userData} ver={profileVer} />;
}
