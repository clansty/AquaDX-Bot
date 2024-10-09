import LevelProgress from '../../../components/LevelProgress';
import { LEVELS, Song } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import getUserProfile from '@/utils/getUserProfile';
import getAquaDxUser from '@/utils/getAquaDxUser';

export default async ({ params }: { params: { username: string, level: string } }) => {
	const profile = await getAquaDxUser(params.username);
	const level = decodeURIComponent(params.level) as typeof LEVELS[number];
	if (!LEVELS.includes(level)) notFound();

	const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
	const userMusic = await profile.getUserMusic(requiredSongList);

	return <LevelProgress userMusic={userMusic} level={level} region={profile.region} requiredSongList={requiredSongList} logo={await profile.getVersionLogo()} />;
}
