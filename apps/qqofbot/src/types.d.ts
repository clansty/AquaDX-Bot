import { BotEnv } from '@clansty/maibot-types';
import { LogLevel } from '@guiiai/logg';

export interface Env extends BotEnv {
	BOT_APPID: string;
	BOT_SECRET: string;
	BOT_SANDBOX: boolean;
	LOG_LEVEL: keyof typeof LogLevel;
	USER_BOT_ID: string;
}
