import B50 from '@/app/b50/components/B50';
import getAquaDxUser from '@/utils/getAquaDxUser';

export default async ({ params }: { params: { username: string } }) => {
	const profile = await getAquaDxUser(params.username);
	const userRating = await profile.getUserRating();
	const userData = await profile.getNameplate();
	const profileVer = await profile.getVersion();

	return <B50 rating={userRating} user={userData} ver={profileVer} />;
}
