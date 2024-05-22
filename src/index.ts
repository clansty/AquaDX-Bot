import { createBot } from './bot';
import { Env } from '../worker-configuration';
import { renderToStaticMarkup } from 'react-dom/server';
import warpBasicReactElement from './render/wrapBasicReactElement';
import { SAMPLE_USER_MUSIC, SAMPLE_USER_RATING } from './consts';
import b50 from './render/b50';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			console.log('Secret-Token 错误');
			return new Response(renderToStaticMarkup(warpBasicReactElement(b50(SAMPLE_USER_RATING, SAMPLE_USER_MUSIC, 'Clansty', 'https://nyac.at/pwa/icon512.png'))), {
				headers: { 'Content-Type': 'text/html' }
			});
		}
		try {
			const req = await request.json();
			console.log(req);
			ctx.waitUntil(createBot(env).handleUpdate(req as any));
		} catch (e) {
			console.error(e);
		}
		return new Response();
	}
};
