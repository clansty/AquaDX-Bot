import { Bot, BotTypes } from './Bot';
import { MessageButton } from './MessageAction';

export abstract class BaseTextMessageAction<T extends BotTypes> {
	protected constructor(
		protected readonly bot: Bot<T>
	) {
	}

	protected _text: string;

	public setText(text: string) {
		this._text = text;
		return this;
	}

	protected _parseAsHtml = false;

	// 如果 html 不支持，会自动清除 html 标签
	public setHtml(html: string) {
		if (this.bot.isHtmlMessageSupported) {
			this._text = html;
			this._parseAsHtml = true;
		} else {
			this._text = html.replace(/<[^>]+>/g, '');
		}
		return this;
	}

	protected _buttons: MessageButton[][] = [];

	public addButtons(buttons: MessageButton[] | MessageButton) {
		if (!Array.isArray(buttons)) {
			buttons = [buttons];
		}
		this._buttons.push(buttons);
		return this;
	}

	public setButtons(buttons: MessageButton[][]) {
		this._buttons = buttons;
		return this;
	}
}
