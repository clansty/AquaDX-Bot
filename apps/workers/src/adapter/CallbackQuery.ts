import { CallbackQueryEventBase, AnswerCallbackQueryAction as AnswerCallbackQueryActionBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';
import { Context } from 'grammy';
import { EditMessageAction, EditMessageActionWithCtx } from './MessageAction';

export class CallbackQueryEvent extends CallbackQueryEventBase<BotTypes> {
	public constructor(protected bot: BotAdapter, private ctx: Context) {
		super(bot);
		this.match = ctx.match as any;
		this.data = ctx.callbackQuery?.data;
	}

	public editMessage() {
		return new EditMessageActionWithCtx(this.bot, this.ctx);
	}

	public answer(): AnswerCallbackQueryAction {
		return new AnswerCallbackQueryAction(this.ctx);
	}
}

export class AnswerCallbackQueryAction extends AnswerCallbackQueryActionBase {
	public constructor(private ctx: Context) {
		super();
	}

	public async dispatch() {
		await this.ctx.answerCallbackQuery({
			text: this._text,
			show_alert: this._showAlert,
			cache_time: this._cacheTime
		});
	}
}
