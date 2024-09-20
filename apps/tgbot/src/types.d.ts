import { BrowserWorker } from '@cloudflare/puppeteer';
import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { BotEnv } from '@clansty/maibot-types';

export interface Env extends BotEnv {
	BOT_TOKEN: string;
	BOT_INFO: string;
	MYBROWSER: BrowserWorker;
	RENDERER: DurableObjectNamespace;
	SENTRY_DSN: string;
	ANAENG: AnalyticsEngineDataset;
	ANAENG_CF_API_TOKEN: string;
	KV: KVNamespace;
}
