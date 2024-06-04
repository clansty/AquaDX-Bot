// Generated by Wrangler on Wed Jun 05 2024 00:18:19 GMT+0800 (China Standard Time)
// by running `wrangler types`

import { BrowserWorker } from '@cloudflare/puppeteer';
import { RENDER_QUEUE_ITEM } from './src/types';

interface Env {
	KV: KVNamespace;
	BOT_TOKEN: string;
	API_SECRET: string;
	POWERON_TOKEN: string;
	API_BASE: string;
	RENDER_QUEUE: Queue<RENDER_QUEUE_ITEM>;
	MYBROWSER: BrowserWorker;
}
