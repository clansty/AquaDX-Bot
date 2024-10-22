import { CommandEventBase, KeywordEventBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';
import type { WSReceiveHandler } from 'node-napcat-ts';
import { NoReportError } from '@clansty/maibot-core';

export class CommandEvent extends CommandEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, public data: WSReceiveHandler['message']) {
		super(bot);
		this.text = data.message.filter(it => it.type === 'text').map(it => it.data.text).join('').trim();
		this.chatId = data.message_type === 'group' ? -data.group_id : data.user_id;
		this.fromId = data.sender.user_id;
		this.messageId = data.message_id;
		this.isPrivate = data.message_type === 'private';
		this.params = this.text.split(' ').slice(1);
		console.log(this.text, this.params);
	}

	public edit(): never {
		throw new NoReportError('不支持编辑消息');
	}

	public async delete(): Promise<void> {
		await this.bot.callApi('delete_msg', { message_id: this.messageId });
	}
}

export class KeywordEvent extends KeywordEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, public data: WSReceiveHandler['message'], match: RegExpMatchArray) {
		super(bot);
		this.text = data.message.filter(it => it.type === 'text').map(it => it.data.text).join('');
		this.chatId = data.message_type === 'group' ? -data.group_id : data.user_id;
		this.fromId = data.sender.user_id;
		this.messageId = data.message_id;
		this.isPrivate = data.message_type === 'private';
		this.match = match;
	}

	public edit(): never {
		throw new NoReportError('不支持编辑消息');
	}

	public async delete(): Promise<void> {
		await this.bot.callApi('delete_msg', { message_id: this.messageId });
	}
}
