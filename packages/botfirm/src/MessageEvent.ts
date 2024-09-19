import { Bot, BotTypes, EventBase } from './Bot';
import { EditMessageAction } from './MessageAction';

export abstract class MessageEventBase<T extends BotTypes> extends EventBase<T> {
	protected constructor(protected bot: Bot<T>) {
		super();
	}

	public text?: string;
	public chatId: T['ChatId'];
	public messageId: T['MessageId'];
	public isPrivate: boolean;

	public reply() {
		return this.bot.constructMessage(this.chatId)
			.replyTo(this.messageId);
	}

	public abstract edit(): EditMessageAction<T>

	public abstract delete(): Promise<void>;
}

export abstract class CommandEventBase<T extends BotTypes> extends MessageEventBase<T> {
	public params: string[];
}

export abstract class KeywordEventBase<T extends BotTypes> extends MessageEventBase<T> {
	public match: RegExpMatchArray;
}
