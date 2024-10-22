import { BotEnv } from '@clansty/maibot-types';
import { LogLevel } from '@guiiai/logg';

export interface Env extends BotEnv {
	BOT_WS_URL: string;
	LOG_LEVEL: keyof typeof LogLevel;
	OFFICIAL_BOT_UIN: number;
}
