import { CommandEventBase, KeywordEventBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';
import { EditMessageAction, EditMessageActionWithCtx } from './MessageAction';
import { Context } from 'grammy';

export class CommandEvent extends CommandEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected ctx: Context) {
		super(bot);
		this.text = ctx.message?.text;
		this.chatId = ctx.chat?.id;
		this.fromId = ctx.from?.id;
		this.messageId = ctx.message?.message_id;
		this.isPrivate = ctx.chat?.type === 'private';
		if ('match' in ctx && typeof ctx.match === 'string' && ctx.match.length) {
			this.params = ctx.match.split(' ');
		}
	}

	public edit() {
		return new EditMessageActionWithCtx(this.bot, this.ctx);
	}

	public async delete(): Promise<void> {
		await this.ctx.deleteMessage();
	}
}

export class KeywordEvent extends KeywordEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, private ctx: Context) {
		super(bot);
		this.text = ctx.message?.text;
		this.chatId = ctx.chat?.id;
		this.fromId = ctx.from?.id;
		this.messageId = ctx.message?.message_id;
		this.isPrivate = ctx.chat?.type === 'private';
		if ('match' in ctx && typeof ctx.match === 'object') {
			this.match = ctx.match;
		}
	}

	public edit(): EditMessageAction {
		return new EditMessageAction(this.bot, this.ctx.message);
	}

	public async delete(): Promise<void> {
		await this.ctx.deleteMessage();
	}
}
