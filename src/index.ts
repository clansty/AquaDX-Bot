import { createBot } from './bot';
import { Env } from '../worker-configuration';
import { renderToStaticMarkup } from 'react-dom/server';
import warpBasicReactElement from './render/wrapBasicReactElement';
import { SAMPLE_USER_MUSIC } from './consts';
import plateProgress from './render/plateProgress';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			console.log('Secret-Token 错误');
			return new Response(renderToStaticMarkup(warpBasicReactElement(plateProgress(SAMPLE_USER_MUSIC, '舞', '极'))), {
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
	}
};
