import { Bot, BotTypes as BotTypesBase, CallbackQueryEventBase, CommandEventBase, InlineQueryEventBase, InlineQueryResultChosenEventBase, KeywordEventBase } from '@clansty/maibot-firm';
import { createLogg } from '@guiiai/logg';
import { SendMessageAction } from './MessageAction';
import { CommandEvent, KeywordEvent } from './MessageEvent';
import { NoReportError } from '@clansty/maibot-core';
import { Bot as BotClient, GroupMessageEvent, MessageElem, PrivateMessageEvent, TextElem } from 'qq-official-bot';

export interface BotTypes extends BotTypesBase<{ isPrivate: boolean, id: string }, string, string, never> {
}

export class BotAdapter extends Bot<BotTypes> {
	public isMessageButtonsSupported = false;
	public isInlineQuerySupported = false;
	public isCallbackQuerySupported = false;
	public isHtmlMessageSupported = false;
	public isFileWithTextSupported = false;
	public isEditMessageSupported = false;

	public constructMessage(targetChat: BotTypes['ChatId']): SendMessageAction {
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

	public readonly client: BotClient;
	private readonly logger = createLogg('BotAdapter').useGlobalConfig();

	public constructor(private readonly appid: string, private readonly secret: string, private readonly sandbox: boolean) {
		super();
		this.client = new BotClient({
			appid, secret, sandbox,
			removeAt: true,
			logLevel: 'info',
			maxRetry: 10,
			intents: [
				'GROUP_AT_MESSAGE_CREATE',
				'C2C_MESSAGE_CREATE'
			]
		});
		this.client.on('message.group', this.handleMessage.bind(this));
		this.client.on('message.private', this.handleMessage.bind(this));
		this.client.start()
			.then(() => this.logger.log('Bot 启动成功'));
	}

	private async handleMessage(data: GroupMessageEvent | PrivateMessageEvent) {
		const text = (data.message as MessageElem[]).filter(it => it.type === 'text').map(it => (it as TextElem).text).join('').trim();
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
			console.error(e);
			if (e instanceof NoReportError) return;

			await data.reply([{
				type: 'reply',
				id: data.message_id
			}, '出现错误：' + e.message || e.toString()]);
		}
	}
}

