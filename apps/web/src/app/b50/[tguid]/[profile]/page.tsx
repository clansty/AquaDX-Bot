import B50 from '@/app/b50/components/B50';
import getUserProfile from '@/utils/getUserProfile';

export const runtime = 'edge';

export default async ({ params }: { params: { tguid: string, profile: string } }) => {
	const profile = await getUserProfile(params.tguid, params.profile);
	const userRating = await profile.getUserRating();
	const userMusic = await profile.getUserMusic();
	const userData = await profile.getNameplate();

	return <B50 rating={userRating} userMusic={userMusic} user={userData} />;
}
