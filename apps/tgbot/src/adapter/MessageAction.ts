import { SendMessageResult as SendMessageResultBase, EditMessageAction as EditMessageActionBase, SendMessageAction as SendMessageActionBase, MessageButtonUrl, MessageButtonCallback, MessageButtonSwitchInline, MessageButton, MessageButtonSwitchInlineOtherChat } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';
import { InlineKeyboardButton, Message } from 'grammy/types';
import { Context } from 'grammy';

export class SendMessageResult extends SendMessageResultBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected message: Message) {
		super(message.message_id);
	}

	public async delete(): Promise<void> {
		await this.bot.client.api.deleteMessage(this.message.chat.id, this.message.message_id);
	}

	public edit(): EditMessageAction {
		return new EditMessageAction(this.bot, this.message);
	}

	public get fileId() {
		if ('document' in this.message) {
			return this.message.document.file_id;
		} else if ('photo' in this.message) {
			return this.message.photo[this.message.photo.length - 1].file_id;
		}
		return null;
	};
}

export const convertMessageButtons = (buttons: MessageButton[][]): InlineKeyboardButton[][] => {
	const inlineKeyboard: InlineKeyboardButton[][] = [];

	for (const row of buttons) {
		const inlineKeyboardRow: InlineKeyboardButton[] = [];
		for (const button of row) {
			if (button instanceof MessageButtonUrl) {
				inlineKeyboardRow.push({
					text: button.text,
					url: button.url
				});
			} else if (button instanceof MessageButtonCallback) {
				inlineKeyboardRow.push({
					text: button.text,
					callback_data: button.callbackData
				});
			} else if (button instanceof MessageButtonSwitchInlineOtherChat) {
				inlineKeyboardRow.push({
					text: button.text,
					switch_inline_query: button.callbackData
				});
			} else if (button instanceof MessageButtonSwitchInline) {
				inlineKeyboardRow.push({
					text: button.text,
					switch_inline_query_current_chat: button.callbackData
				});
			}
		}
		inlineKeyboard.push(inlineKeyboardRow);
	}

	return inlineKeyboard;
};

export class EditMessageAction extends EditMessageActionBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected message: Message) {
		super(bot);
	}

	public async dispatch(): Promise<SendMessageResultBase<BotTypes>> {
		const inlineKeyboard = convertMessageButtons(this._buttons);

		let message: Message;
		if (typeof this._text === 'string') {
			message = await this.bot.client.api.editMessageText(this.message.chat.id, this.message.message_id, this._text, {
				parse_mode: this._parseAsHtml ? 'HTML' as const : undefined,
				reply_markup: {
					inline_keyboard: inlineKeyboard
				},
				link_preview_options: { is_disabled: this._disableLinkPreview }
			}) as any;
		} else {
			message = await this.bot.client.api.editMessageReplyMarkup(this.message.chat.id, this.message.message_id, {
				reply_markup: {
					inline_keyboard: inlineKeyboard
				}
			}) as any;
		}

		return new SendMessageResult(this.bot, message);
	}
}

export class EditMessageActionInline extends EditMessageActionBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected inlineId: string) {
		super(bot);
	}

	public async dispatch(): Promise<SendMessageResultBase<BotTypes>> {
		const inlineKeyboard = convertMessageButtons(this._buttons);

		let message: Message;
		if (typeof this._text === 'string') {
			message = await this.bot.client.api.editMessageTextInline(this.inlineId, this._text, {
				parse_mode: this._parseAsHtml ? 'HTML' as const : undefined,
				reply_markup: {
					inline_keyboard: inlineKeyboard
				},
				link_preview_options: { is_disabled: this._disableLinkPreview }
			}) as any;
		} else {
			message = await this.bot.client.api.editMessageReplyMarkupInline(this.inlineId, {
				reply_markup: {
					inline_keyboard: inlineKeyboard
				}
			}) as any;
		}

		return new SendMessageResult(this.bot, message);
	}
}

export class EditMessageActionWithCtx extends EditMessageActionBase<BotTypes> {
	public constructor(protected bot: BotAdapter, protected ctx: Context) {
		super(bot);
	}

	public async dispatch(): Promise<SendMessageResultBase<BotTypes>> {
		const inlineKeyboard = convertMessageButtons(this._buttons);

		let message: Message;
		if (typeof this._text === 'string') {
			message = await this.ctx.editMessageText(this._text, {
				parse_mode: this._parseAsHtml ? 'HTML' as const : undefined,
				reply_markup: {
					inline_keyboard: inlineKeyboard
				},
				link_preview_options: { is_disabled: this._disableLinkPreview }
			}) as any;
		} else {
			message = await this.ctx.editMessageReplyMarkup({
				reply_markup: {
					inline_keyboard: inlineKeyboard
				}
			}) as any;
		}

		return new SendMessageResult(this.bot, message);
	}
}

export class SendMessageAction extends SendMessageActionBase<BotTypes> {
	public constructor(protected bot: BotAdapter, chatId: BotTypes['ChatId']) {
		super(bot, chatId);
	}

	public async dispatch(): Promise<SendMessageResultBase<BotTypes>> {
		const inlineKeyboard = convertMessageButtons(this._buttons);

		const extra = {
			parse_mode: this._parseAsHtml ? 'HTML' as const : undefined,
			reply_markup: {
				inline_keyboard: inlineKeyboard
			},
			reply_parameters: this._replyToMessageId ? { message_id: this._replyToMessageId } : undefined
		};

		let message: Message;

		switch (this._fileType) {
			case 'audio':
				message = await this.bot.client.api.sendAudio(this.chatId, this._file, {
					caption: this._text,
					...extra
				});
				break;
			case 'photo':
				message = await this.bot.client.api.sendPhoto(this.chatId, this._file, {
					caption: this._text,
					...extra
				});
				break;
			case 'document':
				message = await this.bot.client.api.sendDocument(this.chatId, this._file, {
					caption: this._text,
					...extra
				});
				break;
			default:
				message = await this.bot.client.api.sendMessage(this.chatId, this._text, {
					...extra,
					link_preview_options: { is_disabled: this._disableLinkPreview }
				});
				break;
		}

		return new SendMessageResult(this.bot, message);
	}
}
