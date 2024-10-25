import { Bot, BotTypes, EventBase } from './Bot';
import { EditMessageAction } from './MessageAction';
import { BaseTextMessageAction } from './BaseTextMessageAction';

export abstract class InlineQueryEventBase<T extends BotTypes> extends EventBase<T> {
	protected constructor(public bot: Bot<T>) {
		super();
	}

	public match: RegExpMatchArray;
	public data: string;

	public abstract answer(): AnswerInlineQueryAction<T>;
}

export abstract class InlineQueryResultChosenEventBase<T extends BotTypes> extends EventBase<T> {
	protected constructor(protected bot: Bot<T>) {
		super();
	}

	public match: RegExpMatchArray;
	public resultId: string;

	public abstract editMessage(): EditMessageAction<T>;
}

export abstract class AnswerInlineQueryAction<T extends BotTypes> {
	protected constructor(protected bot: Bot<T>) {
	}

	public abstract dispatch(): Promise<void>;

	protected _cacheTime?: number;

	public withCacheTime(seconds: number) {
		this._cacheTime = seconds;
		return this;
	}

	protected _isPersonal?: boolean;

	public isPersonal() {
		this._isPersonal = true;
		return this;
	}

	protected _buttonText?: string;
	protected _buttonStart?: string;

	public withStartButton(text: string, startParameter: string) {
		this._buttonText = text;
		this._buttonStart = startParameter;
		return this;
	}

	protected _results: InlineQueryAnswer<T>[] = [];

	public addTextResult(id: string, title: string) {
		let result = this.createTextAnswer(id, title);
		this._results.push(result);
		return result;
	}

	protected abstract createTextAnswer(id: string, title: string): InlineQueryAnswerText<T>;

	public addPhotoResult(id: string, photoUrl: string) {
		let result = this.createPhotoAnswer(id, photoUrl);
		this._results.push(result);
		return result;
	}

	protected abstract createPhotoAnswer(id: string, photoUrl: string): InlineQueryAnswerPhoto<T>;

	public addAudioResult(id: string, audioId: string) {
		let result = this.createAudioAnswer(id, audioId);
		this._results.push(result);
		return result;
	}

	protected abstract createAudioAnswer(id, audioId): InlineQueryAnswerAudio<T>;
}

abstract class InlineQueryAnswer<T extends BotTypes> extends BaseTextMessageAction<T> {
	public abstract compose(): T['InlineQueryAnswer'];

	public constructor(
		bot: Bot<T>,
		protected _id: string
	) {
		super(bot);
	}

	protected _title: string;

	public setTitle(title: string) {
		this._title = title;
		return this;
	}

	protected _description?: string;

	public setDescription(description: string) {
		this._description = description;
		return this;
	}
}

export abstract class InlineQueryAnswerText<T extends BotTypes> extends InlineQueryAnswer<T> {
	protected constructor(
		bot: Bot<T>,
		id: string,
		title: string
	) {
		super(bot, id);
		this.setTitle(title);
	}
}

export abstract class InlineQueryAnswerPhoto<T extends BotTypes> extends InlineQueryAnswer<T> {
	protected constructor(
		bot: Bot<T>,
		id: string,
		protected _photoUrl: string
	) {
		super(bot, id);
	}
}

export abstract class InlineQueryAnswerAudio<T extends BotTypes> extends InlineQueryAnswer<T> {
	protected constructor(
		bot: Bot<T>,
		id: string,
		protected _audioId: string
	) {
		super(bot, id);
	}
}
