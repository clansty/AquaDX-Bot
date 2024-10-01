import { Bot, BotTypes } from './Bot';

export abstract class SendMessageResult<T extends BotTypes> {
	protected constructor(
		public readonly messageId: T['MessageId']
	) {
	}

	public abstract delete(): Promise<void>;

	public abstract edit(): EditMessageAction<T>

	// 用于图片缓存
	public abstract fileId?: T['SendableFile'];
}

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

abstract class DispatchableMessageAction<T extends BotTypes> extends BaseTextMessageAction<T> {
	public abstract dispatch(): Promise<SendMessageResult<T>>;

	protected _replyToMessageId: T['MessageId'];

	public replyTo(messageId: T['MessageId']) {
		this._replyToMessageId = messageId;
		return this;
	}

	protected _disableLinkPreview = false;

	public disableLinkPreview() {
		this._disableLinkPreview = true;
		return this;
	}
}

export abstract class EditMessageAction<T extends BotTypes> extends DispatchableMessageAction<T> {
	protected _clearButtons = false;

	public clearButtons() {
		this._clearButtons = true;
		return this;
	}
}

export abstract class SendMessageAction<T extends BotTypes> extends DispatchableMessageAction<T> {
	protected constructor(
		bot: Bot<T>,
		public readonly chatId: T['ChatId']
	) {
		super(bot);
	}

	protected _file: T['SendableFile'] = null;
	protected _fileType: 'audio' | 'document' | 'photo' = null;

	public addPhoto(file: T['SendableFile']) {
		this._fileType = 'photo';
		this._file = file;
		return this;
	}

	public addAudio(file: T['SendableFile']) {
		this._fileType = 'audio';
		this._file = file;
		return this;
	}

	public addDocument(file: T['SendableFile']) {
		this._fileType = 'document';
		this._file = file;
		return this;
	}

	// 防止 tg 压缩图片，qq 里应该不用理会
	public filesAsDocument() {
		this._fileType = 'document';
		return this;
	}
}

export interface MessageButton {
	text: string;
}

export class MessageButtonCallback implements MessageButton {
	constructor(
		public readonly text: string,
		public readonly callbackData: string
	) {
	}
}

export class MessageButtonSwitchInline implements MessageButton {
	constructor(
		public readonly text: string,
		public readonly callbackData: string
	) {
	}
}

export class MessageButtonSwitchInlineOtherChat extends MessageButtonSwitchInline {
}

export class MessageButtonUrl implements MessageButton {
	constructor(
		public readonly text: string,
		public readonly url: string
	) {
	}
}
