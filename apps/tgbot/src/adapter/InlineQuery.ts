import { InlineQueryEventBase, AnswerInlineQueryAction as AnswerInlineQueryActionBase, InlineQueryAnswerText as InlineQueryAnswerTextBase, InlineQueryAnswerPhoto as InlineQueryAnswerPhotoBase, InlineQueryAnswerAudio as InlineQueryAnswerAudioBase, InlineQueryResultChosenEventBase, EditMessageAction } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';
import { Context } from 'grammy';
import { InlineQueryResult } from 'grammy/types';
import { convertMessageButtons, EditMessageActionInline } from './MessageAction';

export class InlineQueryEvent extends InlineQueryEventBase<BotTypes> {
	constructor(public bot: BotAdapter, protected ctx: Context) {
		super(bot);
		this.match = ctx.match as any;
		this.data = ctx.inlineQuery.query;
		this.fromId = ctx.from?.id;
	}

	public answer() {
		return new AnswerInlineQueryAction(this.bot, this.ctx);
	}
}

export class InlineQueryResultChosenEvent extends InlineQueryResultChosenEventBase<BotTypes> {
	constructor(protected bot: BotAdapter, protected ctx: Context) {
		super(bot);
		this.match = ctx.match as any;
		this.resultId = ctx.chosenInlineResult.result_id;
		this.fromId = ctx.from?.id;
	}

	public editMessage(): EditMessageAction<BotTypes> {
		return new EditMessageActionInline(this.bot, this.ctx.inlineMessageId);
	}
}

export class AnswerInlineQueryAction extends AnswerInlineQueryActionBase<BotTypes> {
	constructor(protected bot: BotAdapter, protected ctx: Context) {
		super(bot);
	}

	public async dispatch(): Promise<void> {
		await this.ctx.answerInlineQuery(this._results.map(result => result.compose()), {
			cache_time: this._cacheTime,
			is_personal: this._isPersonal,
			button: this._buttonText ? {
				text: this._buttonText,
				start_parameter: this._buttonStart
			} : undefined
		});
	}

	protected createTextAnswer(id: string, title: string) {
		return new InlineQueryAnswerText(this.bot, id, title);
	}

	protected createPhotoAnswer(id: string, photoUrl: string) {
		return new InlineQueryAnswerPhoto(this.bot, id, photoUrl);
	}

	protected createAudioAnswer(id: any, audioId: any) {
		return new InlineQueryAnswerAudio(this.bot, id, audioId);
	}
}

export class InlineQueryAnswerText extends InlineQueryAnswerTextBase<BotTypes> {
	constructor(bot: BotAdapter, id: string, title: string) {
		super(bot, id, title);
	}

	public compose(): InlineQueryResult {
		return {
			id: this._id,
			type: 'article',
			title: this._title,
			description: this._description,
			input_message_content: {
				message_text: this._text,
				parse_mode: this._parseAsHtml ? 'HTML' : undefined
			},
			reply_markup: {
				inline_keyboard: convertMessageButtons(this._buttons)
			}
		};
	}
}

export class InlineQueryAnswerPhoto extends InlineQueryAnswerPhotoBase<BotTypes> {
	constructor(bot: BotAdapter, id: string, photoUrl: string) {
		super(bot, id, photoUrl);
	}

	public compose(): InlineQueryResult {
		return {
			id: this._id,
			type: 'photo',
			photo_url: this._photoUrl,
			thumbnail_url: this._photoUrl,
			title: this._title,
			description: this._description,
			caption: this._text,
			parse_mode: this._parseAsHtml ? 'HTML' : undefined,
			reply_markup: {
				inline_keyboard: convertMessageButtons(this._buttons)
			},
		};
	}
}

export class InlineQueryAnswerAudio extends InlineQueryAnswerAudioBase<BotTypes> {
	constructor(bot: BotAdapter, id: string, audioId: string) {
		super(bot, id, audioId);
	}

	public compose(): InlineQueryResult {
		return {
			id: this._id,
			type: 'audio',
			audio_file_id: this._audioId,
			title: this._title,
			reply_markup: {
				inline_keyboard: convertMessageButtons(this._buttons)
			},
			caption: this._text,
			parse_mode: this._parseAsHtml ? 'HTML' : undefined,
		};
	}
}
