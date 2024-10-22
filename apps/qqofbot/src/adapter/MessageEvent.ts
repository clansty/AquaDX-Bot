import { CommandEventBase, KeywordEventBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes, ChatId } from './Bot';
import { NoReportError } from '@clansty/maibot-core';
import { GroupMessageEvent, MessageElem, PrivateMessageEvent, TextElem } from 'qq-official-bot';

export class CommandEvent extends CommandEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, public data: GroupMessageEvent | PrivateMessageEvent) {
		super(bot);
		this.text = (data.message as MessageElem[]).filter(it => it.type === 'text').map(it => (it as TextElem).text).join('').trim();
		this.isPrivate = data.message_type === 'private';
		this.chatId = new ChatId(this.isPrivate, this.isPrivate ? data.user_id : data.group_id);
		this.fromId = new ChatId(true, data.sender.user_id);
		this.messageId = data.message_id;
		this.params = this.text.split(' ').slice(1);
	}

	public edit(): never {
		throw new NoReportError('不支持编辑消息');
	}

	public async delete(): Promise<void> {
		if (this.isPrivate) {
			await this.bot.client.recallPrivateMessage(this.chatId.id, this.messageId);
		} else {
			await this.bot.client.recallGroupMessage(this.chatId.id, this.messageId);
		}
	}
}

export class KeywordEvent extends KeywordEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, public data: GroupMessageEvent | PrivateMessageEvent, match: RegExpMatchArray) {
		super(bot);
		this.text = (data.message as MessageElem[]).filter(it => it.type === 'text').map(it => (it as TextElem).text).join('').trim();
		this.isPrivate = data.message_type === 'private';
		this.chatId = new ChatId(this.isPrivate, this.isPrivate ? data.user_id : data.group_id);
		this.fromId = new ChatId(true, data.sender.user_id);
		this.messageId = data.message_id;
		this.match = match;
	}

	public edit(): never {
		throw new NoReportError('不支持编辑消息');
	}

	public async delete(): Promise<void> {
		if (this.isPrivate) {
			await this.bot.client.recallPrivateMessage(this.chatId.id, this.messageId);
		} else {
			await this.bot.client.recallGroupMessage(this.chatId.id, this.messageId);
		}
	}
}
