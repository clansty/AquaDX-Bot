import { ALL_MUSIC } from '@clansty/maibot-data';

const knownList = `001301
010255
011674
011675
011676
011677
011678
011679
011680
011681
011682
011683
011684
011685
011699
011708
011709
011712
011715
011716
011717
011718
011720
011721
011722
011723
011724
011725
011726
011727
011728
011729
011735
121437`

const data = ALL_MUSIC;
const missing: string[] = [];

for (const id of knownList.split('\n')) {
	if (!data[Number(id)]) {
		missing.push(id);
	}
}

if (missing.length) {
	console.log('Missing music:');
	console.log(missing.join(' '));
}
