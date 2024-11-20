import { routeLoader$ } from '@builder.io/qwik-city';
import getUserProfile from '~/utils/getUserProfile';
import B50 from '~/routes/b50/components/B50';
import { component$ } from '@builder.io/qwik';
import { UserProfile } from '@clansty/maibot-clients';

export const useData = routeLoader$(async ({ platform, params }) => {
	const profile = await getUserProfile(params.tguid, params.profile, platform.env);
	const userRating = await profile.getUserRating();
	const userData = await profile.getNameplate();
	const profileVer = await profile.getVersion();

	return { userRating, userData, profileVer };
});

export default component$((props: { params: Promise<{ tguid: string, profile: string }> }) => {
	const data = useData();

	return <B50 rating={data.value.userRating} user={data.value.userData} ver={data.value.profileVer} />;
});
