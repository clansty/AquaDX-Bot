import { BA_VE, PLATE_TYPE, PLATE_VER, Song } from '@clansty/maibot-types';
import { notFound } from 'next/navigation';
import PlateProgress from '@/app/plateProgress/components/PlateProgress';
import getUserProfile from '@/utils/getUserProfile';
import getAquaDxUser from '@/utils/getAquaDxUser';

export default async (props: { params: Promise<{ username: string, type: string }> }) => {
    const params = await props.params;
    const profile = await getAquaDxUser(params.username);
    let type = decodeURIComponent(params.type) as typeof PLATE_TYPE[number] | '';
    let ver: typeof PLATE_VER[number] | typeof BA_VE;
    if (type as any === BA_VE) {
		ver = BA_VE;
		type = '';
	} else {
		ver = type.substring(0, 1) as any;
		type = type.substring(1) as any;
		if (!(PLATE_VER.includes(ver as any) && PLATE_TYPE.includes(type as any))) notFound();
	}

    const profileVer = await profile.getVersion();
    const requiredList = (await profile.plateSongs())[ver].map(it => Song.fromId(it, profileVer));
    const userMusic = await profile.getUserMusic(requiredList);

    return <PlateProgress userMusic={userMusic} type={type} ver={ver} requiredList={requiredList} logo={await profile.getVersionLogo()} />;
};
