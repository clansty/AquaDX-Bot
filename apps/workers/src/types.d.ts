import { InlineKeyboardButton } from 'telegraf/types';
import Renderer from './renderer/Renderer';

export type RENDER_QUEUE_ITEM = {
	chatId: number,
	replyToMessageId: number,
	processingMessageId?: number,
	isFromStart: boolean,
	hash: string,
	inlineKeyboard: InlineKeyboardButton[][],
	shareKw?: string,
	filename: string,
	queueTime: number,
	html: string,
	width: number
}

export type RenderTypeArgs = {
	action: 'levelProgress',
	args: Parameters<Renderer['renderLevelProgress']>
} | {
	action: 'b50',
	args: Parameters<Renderer['renderB50']>
} | {
	action: 'plateProgress',
	args: Parameters<Renderer['plateProgress']>
}
