import { SendMessageAction as SendMessageActionBase, SendMessageResult as SendMessageResultBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes, ChatId } from './Bot';
import { NoReportError } from '@clansty/maibot-core';
import { MessageElem, Sendable } from 'qq-official-bot';

export class SendMessageResult extends SendMessageResultBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected data: { id: string }, private chat: ChatId) {
		super(data.id);
	}

	public async delete(): Promise<void> {
		if (this.chat.isPrivate) {
			await this.bot.client.recallPrivateMessage(this.chat.id, this.messageId);
		} else {
			await this.bot.client.recallGroupMessage(this.chat.id, this.messageId);
		}
	}

	public edit(): never {
		throw new NoReportError('不支持编辑消息');
	}

	public get fileId() {
		return null;
	};
}

export class SendMessageAction extends SendMessageActionBase<BotTypes> {
	public constructor(protected bot: BotAdapter, chatId: BotTypes['ChatId']) {
		super(bot, chatId);
	}

	public async dispatch(): Promise<SendMessageResultBase<BotTypes>> {
		let params: MessageElem[] = [];

		if (this._replyToMessageId) {
			params = [{
				type: 'reply',
				id: this._replyToMessageId
			}];
		}

		switch (this._fileType) {
			case 'audio':
				throw new Error('应该不会发这玩意');
			case 'photo':
			// qq 不用考虑长图压缩
			case 'document':
				params.push({
					type: 'image',
					file: this._file
				});
				break;
		}

		if (this._text) {
			if (!this.chatId.isPrivate) {
				// 前面被塞了 @，把内容推到下一行
				this._text = '\n' + this._text;
			}
			params.push({
				type: 'text',
				// url
				text: this._text.replaceAll('.', '.\u200e')
			});
		}

		const ret = await (this.chatId.isPrivate ? this.bot.client.sendPrivateMessage : this.bot.client.sendGroupMessage).bind(this.bot.client
		)(this.chatId.id, params as Sendable, this._replyToMessageId ? { id: this._replyToMessageId } : undefined);
		return new SendMessageResult(this.bot, ret, this.chatId);
	}
}
