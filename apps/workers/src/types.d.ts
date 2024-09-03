import { CloudflareEnv } from '@clansty/maibot-types';
import { BrowserWorker } from '@cloudflare/puppeteer';
import { DurableObjectNamespace } from '@cloudflare/workers-types';

export type RENDER_REQUEST = {
	url: string,
	width: number
}

export type Env = CloudflareEnv & {
	BOT_TOKEN: string;
	BOT_INFO: string;
	MYBROWSER: BrowserWorker;
	RENDERER: DurableObjectNamespace;
	ADMIN_UIDS: string;
	ADMIN_SECRET: string;
	GENIUS_SECRET: string;
	TELEGRAPH_SECRET: string;
	DEEPL_AUTH_KEY: string;
	SENTRY_DSN: string;
	ANAENG: AnalyticsEngineDataset;
	ANAENG_CF_API_TOKEN: string;
}
