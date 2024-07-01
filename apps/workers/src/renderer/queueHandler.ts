import { Env } from '../types';
import { RENDER_QUEUE_ITEM } from '../types';
import puppeteer from '@cloudflare/puppeteer';
import Renderer from './Renderer';
import { Telegraf } from 'telegraf';
import { Message } from 'telegraf/types';

export default async (batch: MessageBatch<RENDER_QUEUE_ITEM>, env: Env, ctx: ExecutionContext) => {
	let browser: puppeteer.Browser;
	try {
		browser = await getBrowser(env.MYBROWSER);
	} catch (e) {
		console.error('爆了', e);
		batch.retryAll({ delaySeconds: 5 });
		return;
	}
	console.log('浏览器已创建', new Date());
	const bot = new Telegraf(env.BOT_TOKEN);
	const renderer = new Renderer(browser);

	for (const message of batch.messages) {
		const startDate = new Date().getTime();
		try {
			console.log('处理消息', new Date());
			const { inlineKeyboard, shareKw, hash, chatId, replyToMessageId, processingMessageId, filename, queueTime } = message.body;
			const queueDate = new Date(queueTime).getTime();
			// 控制是否显示不能用 inline 发送的提示，要是以图片方式发送了，就把这个设为 false
			let { isFromStart } = message.body;
			let messageSent: Message;
			// 再次确认缓存的 key
			const cached = await env.KV.get(`image:${hash}`, 'json') as { fileId: string, type: 'image' | 'document' };

			if (cached?.type === 'image') {
				if (shareKw) {
					inlineKeyboard.push([{
						text: '分享',
						switch_inline_query: shareKw
					}]);
				}
				isFromStart = false;

				messageSent = await bot.telegram.sendPhoto(chatId, cached.fileId, {
					reply_parameters: { message_id: replyToMessageId },
					reply_markup: { inline_keyboard: inlineKeyboard }
				});
			} else if (cached?.type === 'document') {
				messageSent = await bot.telegram.sendDocument(chatId, cached.fileId, {
					reply_parameters: { message_id: replyToMessageId },
					reply_markup: { inline_keyboard: inlineKeyboard }
				});
			}
			// End: 发现有缓存的图片发送
			else {
				// 开始生成图片
				const file = await renderer.renderHtml(message.body.url, message.body.width);
				const endDate = new Date().getTime();
				console.log('生成结束', new Date());
				const timeSummary = `队列时间: ${Math.round((startDate - queueDate) / 1000)}s\n生成时间: ${Math.round((endDate - startDate) / 1000)}s`;
				if (file.height / file.width > 2) {
					messageSent = await bot.telegram.sendDocument(chatId, { source: file.data, filename }, {
						reply_parameters: { message_id: replyToMessageId },
						reply_markup: { inline_keyboard: inlineKeyboard },
						caption: timeSummary
					});
					if (hash)
						ctx.waitUntil(env.KV.put(`image:${hash}`, JSON.stringify({ fileId: messageSent.document.file_id, type: 'document' })));
				} else {
					if (shareKw) {
						inlineKeyboard.push([{
							text: '分享',
							switch_inline_query: shareKw
						}]);
					}
					isFromStart = false;

					messageSent = await bot.telegram.sendPhoto(chatId, { source: file.data, filename }, {
						reply_parameters: { message_id: replyToMessageId },
						reply_markup: { inline_keyboard: inlineKeyboard },
						caption: timeSummary
					});
					if (hash)
						ctx.waitUntil(env.KV.put(`image:${hash}`, JSON.stringify({ fileId: messageSent.photo[messageSent.photo.length - 1].file_id, type: 'image' })));
				}
				console.log('发送结束', new Date());
			}
			// End: 发送图片

			message.ack();
			if (processingMessageId)
				try {
					await bot.telegram.deleteMessage(chatId, processingMessageId);
					console.log('删除消息完成', new Date());
				} catch (e) {
					console.log('删除消息失败', e, '无所谓');
				}

			// 处理通过 start 发送时，作为文件发送的提示
			// 不用检测是不是以图片发送的，因为前面如果以图片方式发送了，就会把 isFromStart 设为 false
			if (isFromStart) {
				try {
					await bot.telegram.sendMessage(chatId, '由于图片高度太高，暂时不支持使用行内模式发送', {
						reply_parameters: { message_id: messageSent.message_id }
					});
					console.log('发送高度提示', new Date());
				} catch (e) {
					console.log('发送消息失败', e, '无所谓');
				}
			}
		} catch (e) {
			console.error('单条消息处理失败', e);
			message.retry();
		}
	}
	browser.disconnect();
	console.log('队列完成', new Date());
}

const getBrowser = async (endpoint: puppeteer.BrowserWorker) => {
	// Pick random session from open sessions
	let sessionId = await getRandomSession(endpoint);
	if (sessionId) {
		try {
			return await puppeteer.connect(endpoint, sessionId);
		} catch (e) {
			// another worker may have connected first
			console.log(`Failed to connect to ${sessionId}. Error ${e}`, new Date());
		}
	}
	console.log('No open sessions, launch new session', new Date());
	return await puppeteer.launch(endpoint, { keep_alive: 600000 });
};

// Pick random free session
// Other custom logic could be used instead
// https://developers.cloudflare.com/browser-rendering/get-started/reuse-sessions/#4-code
const getRandomSession = async (endpoint: puppeteer.BrowserWorker): Promise<string> => {
	const sessions: puppeteer.ActiveSession[] = await puppeteer.sessions(endpoint);
	console.log(`Sessions: ${JSON.stringify(sessions)}`, new Date());
	const sessionsIds = sessions
		.filter(v => !v.connectionId)
		.map(v => v.sessionId);

	if (sessionsIds.length === 0) {
		return;
	}

	const sessionId = sessionsIds[Math.floor(Math.random() * sessionsIds.length)];
	return sessionId!;
};
