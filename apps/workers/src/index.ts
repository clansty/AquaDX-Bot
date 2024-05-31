import { createBot } from './bot';
import { Env } from '../worker-configuration';
import createRouter from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			return await createRouter(env).handle(request);
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
