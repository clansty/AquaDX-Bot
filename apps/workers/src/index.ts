import { Update } from 'grammy/types';
import { createBot } from './bot';
import { Env } from './types';
import NoReportError from './utils/NoReportError';
import { BotError } from 'grammy';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			console.log('Secret-Token 错误');
			return new Response();
		}
		const req = await request.json();
		ctx.waitUntil(tryHandleUpdate(req as Update, env));
		return new Response();
	}
};

const tryHandleUpdate = async (update: Update, env: Env) => {
	const bot = createBot(env);
	try {
		await bot.handleUpdate(update);
	} catch (err: any) {
		console.error('处理请求时发生错误', err);
		if (err instanceof BotError) err = err.error;
		if (update.message?.chat) {
			if (err instanceof NoReportError) return;
			if (['message is not modified'].some(it => err?.message?.includes?.(it))) return;
			await bot.api.sendMessage(update.message.chat.id, '发生错误：' + err.message);
		}
	}
};

export { Renderer } from './renderer/Renderer';
