import { createBot } from './bot';
import { Env } from '../worker-configuration';
import { renderToStaticMarkup } from 'react-dom/server';
import { SAMPLE_USER_MUSIC, SAMPLE_USER_RATING } from '@clansty/maibot-types';
import { b50 } from '@clansty/maibot-components';
import wrapBasicReactElement from './utils/wrapBasicReactElement';
import queueHandler from './renderer/queueHandler';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			console.log('Secret-Token 错误');
			return new Response(renderToStaticMarkup(wrapBasicReactElement(b50(SAMPLE_USER_RATING, SAMPLE_USER_MUSIC, 'qwq', ''))), {
				headers: { 'Content-Type': 'text/html' }
			});
		}
		try {
			const req = await request.json();
			if (process.env.NODE_ENV === 'development')
				console.log(JSON.stringify(req));
			else
				console.log(req);
			ctx.waitUntil(createBot(env).handleUpdate(req as any));
		} catch (e) {
			console.error(e);
		}
		return new Response();
	},
	queue: queueHandler
};
