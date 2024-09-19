import { Bot, BotTypes, EventBase } from './Bot';
import { EditMessageAction } from './MessageAction';

export abstract class CallbackQueryEventBase<T extends BotTypes> extends EventBase<T> {
	protected constructor(protected bot: Bot<T>) {
		super();
	}

	public match: RegExpMatchArray;
	public data: string;

	public abstract editMessage(): EditMessageAction<T>;
	public abstract answer(): AnswerCallbackQueryAction;
}

export abstract class AnswerCallbackQueryAction {
	public abstract dispatch(): Promise<void>;

	protected _text?: string;
	protected _showAlert?: boolean;
	protected _cacheTime?: number;

	public withNotify(text: string) {
		this._text = text;
		return this;
	}

	public withAlert(text: string) {
		this._showAlert = true;
		this._text = text;
		return this;
	}

	public withCacheTime(seconds: number) {
		this._cacheTime = seconds;
		return this;
	}
}
