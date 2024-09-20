import { Bot, BotTypes as BotTypesBase, CallbackQueryEventBase, CommandEventBase, InlineQueryEventBase, InlineQueryResultChosenEventBase, KeywordEventBase } from '@clansty/maibot-firm';
import { createLogg } from '@guiiai/logg';
import type { Receive, WSReceiveHandler, WSSendParam, WSSendReturn } from 'node-napcat-ts';
import _ from 'lodash';
import { SendMessageAction } from './MessageAction';
import { CommandEvent, KeywordEvent } from './MessageEvent';

export interface BotTypes extends BotTypesBase<number, number, string, never> {
}

export class BotAdapter extends Bot<BotTypes> {
	public isMessageButtonsSupported = false;
	public isInlineQuerySupported = false;
	public isCallbackQuerySupported = false;
	public isHtmlMessageSupported = false;
	public isFileWithTextSupported = false;
	public isEditMessageSupported = false;

	public constructMessage(targetChat: number) {
		return new SendMessageAction(this, targetChat);
	}

	private commandHandlers = [] as Array<{ command: string, handler: (event: CommandEventBase<BotTypes>) => Promise<boolean> }>;

	public registerCommand(command: string | string[], handler: (event: CommandEventBase<BotTypes>) => Promise<boolean>): void {
		if (Array.isArray(command)) {
			for (const c of command) {
				this.commandHandlers.push({ command: c, handler });
			}
		} else {
			this.commandHandlers.push({ command, handler });
		}
	}

	private keywordHandlers = [] as Array<{ keyword: RegExp, handler: (event: KeywordEventBase<BotTypes>) => Promise<boolean> }>;

	public registerKeyword(keyword: RegExp | RegExp[], handler: (event: KeywordEventBase<BotTypes>) => Promise<boolean>): void {
		if (Array.isArray(keyword)) {
			for (const k of keyword) {
				this.keywordHandlers.push({ keyword: k, handler });
			}
		} else {
			this.keywordHandlers.push({ keyword, handler });
		}
	}

	public registerCallbackQuery(data: RegExp | RegExp[], handler: (event: CallbackQueryEventBase<BotTypes>) => Promise<boolean>): void {
	}

	public registerInlineQuery(query: RegExp | RegExp[], handler: (event: InlineQueryEventBase<BotTypes>) => Promise<boolean>): void {
	}

	public registerInlineQueryResultChosen(resultId: RegExp | RegExp[], handler: (event: InlineQueryResultChosenEventBase<BotTypes>) => Promise<boolean>): void {
	}

	private readonly ws: WebSocket;
	private readonly logger = createLogg('BotAdapter').useGlobalConfig();

	public constructor(private readonly wsUrl: string) {
		super();
		this.ws = new WebSocket(wsUrl);
		this.ws.onopen = () => this.logger.log('WS 连接成功');
		this.ws.onmessage = (e) => this.handleWebSocketMessage(e.data);
	}

	private readonly echoMap = new Map<string, { resolve: (result: any) => void; reject: (result: any) => void }>();
	private echoSeq = 0;

	public async callApi<T extends keyof WSSendReturn>(action: T, params?: WSSendParam[T]): Promise<WSSendReturn[T]> {
		return new Promise<WSSendReturn[T]>((resolve, reject) => {
			const echo = `${new Date().getTime()}-${this.echoSeq++}-${_.random(100000, 999999)}`;
			this.echoMap.set(echo, { resolve, reject });
			this.ws.send(JSON.stringify({ action, params, echo }));
			this.logger.debug('send', JSON.stringify({ action, params, echo }));
		});
	}

	private async handleWebSocketMessage(message: string) {
		this.logger.debug('receive', message);
		const data = JSON.parse(message) as WSReceiveHandler[keyof WSReceiveHandler] & { echo: string; status: 'ok' | 'error'; data: any; message: string };
		if (data.echo) {
			const promise = this.echoMap.get(data.echo);
			if (!promise) return;
			this.echoMap.delete(data.echo);
			if (data.status === 'ok') {
				promise.resolve(data.data);
			} else {
				promise.reject(data.message);
			}
			return;
		}
		if (data.post_type === 'message')
			await this.handleMessage(data);
		else if (data.post_type === 'request' && data.request_type === 'friend') {
			this.logger
				.withField('QQ', data.user_id)
				.withField('备注', data.comment)
				.log('收到好友请求');
			await this.callApi('set_friend_add_request', { flag: data.flag, approve: true });
		} else if (data.post_type === 'request' && data.request_type === 'group' && data.sub_type === 'invite') {
			this.logger
				.withField('QQ', data.user_id)
				.withField('群', data.group_id)
				.log('收到加群请求');
			await this.callApi('set_group_add_request', { flag: data.flag, approve: true });
		}
	}

	private async handleMessage(data: WSReceiveHandler['message']) {
		const text = data.message.find(it => it.type === 'text')?.data.text.trim();
		if (!text) return;

		const firstWord = text.split(' ')[0];
		try {
			for (const { command, handler } of this.commandHandlers) {
				if (firstWord.toLowerCase() === '/' + command) {
					this.logger
						.withField('QQ', data.user_id)
						.withField('命令', command)
						.withField('消息', text)
						.log('处理命令');
					const res = await handler(new CommandEvent(this, data));
					if (res) return;
				}
			}

			for (const { keyword, handler } of this.keywordHandlers) {
				const exec = keyword.exec(text);
				if (exec) {
					this.logger
						.withField('QQ', data.user_id)
						.withField('正则', keyword)
						.withField('消息', text)
						.log('处理关键词');
					const res = await handler(new KeywordEvent(this, data, exec));
					if (res) return;
				}
			}
		} catch (e) {
			this.logger.withError(e).error('处理消息时出错');
			console.error(e)

			await this.constructMessage('group_id' in data ? -data.group_id : data.user_id)
				.setText('出现错误：' + e.message || e.toString())
				.dispatch();
		}
	}
}

