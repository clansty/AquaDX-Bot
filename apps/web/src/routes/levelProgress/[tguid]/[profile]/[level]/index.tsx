import LevelProgress from '../../../components/LevelProgress';
import { LEVELS, Song } from '@clansty/maibot-types';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getUserProfile from '~/utils/getUserProfile';

export const useData = routeLoader$(async ({ platform, params, error }) => {
	const level = decodeURIComponent(params.level) as typeof LEVELS[number];
	if (!LEVELS.includes(level)) {
		error(404, 'nya?');
	}

	const profile = await getUserProfile(params.tguid, params.profile, platform.env);
	const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
	const userMusic = await profile.getUserMusic(requiredSongList);
	const versionLogo = await profile.getVersionLogo();
	const version = await profile.getVersion();

	return { requiredSongList: requiredSongList.map(it => it.dxId), userMusic, region: profile.region, level, versionLogo, version };
});

export default component$(() => {
	const data = useData();

	return <LevelProgress userMusic={data.value.userMusic} level={data.value.level} region={data.value.region}
		requiredSongIdList={data.value.requiredSongList} logo={data.value.versionLogo} version={data.value.version} />;
});