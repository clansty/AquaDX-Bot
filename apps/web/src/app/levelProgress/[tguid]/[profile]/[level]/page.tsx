import LevelProgress from '../../../components/LevelProgress';
import { LEVELS, Song } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import getUserProfile from '@/utils/getUserProfile';

export default async (
    props: { params: Promise<{ tguid: string, level: string, profile: string }> }
) => {
    const params = await props.params;
    const level = decodeURIComponent(params.level) as typeof LEVELS[number];
    if (!LEVELS.includes(level)) notFound();

    const profile = await getUserProfile(params.tguid, params.profile);
    const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
    const userMusic = await profile.getUserMusic(requiredSongList);

    return <LevelProgress userMusic={userMusic} level={level} region={profile.region} requiredSongList={requiredSongList} logo={await profile.getVersionLogo()} />;
};
