import { b50 } from '@clansty/maibot-components';
import { SAMPLE_USER_MUSIC, SAMPLE_USER_RATING } from '@clansty/maibot-types';

export default () => b50(SAMPLE_USER_RATING, SAMPLE_USER_MUSIC, 'Clansty', '', song => song && `/song/byId/${song.id}`)
