import { BundledMessageBase, BundledMessageNodeBase } from '@clansty/maibot-firm';
import { BotAdapter, BotTypes } from './Bot';

export class BundledMessage extends BundledMessageBase<BotTypes> {
	public constructor(protected bot: BotAdapter) {
		super();
	}

	protected _nodes: BundledMessageNode[] = [];

	public addNode() {
		const node = new BundledMessageNode(this.bot);
		this._nodes.push(node);
		return node;
	}

	public compose() {
		return {
			message: this._nodes.map(node => node.compose()),
			source: this._title,
			news: this._description.split('\n').filter(it => it).map(line => ({ text: line })),
			summary: this._summary,
			prompt: this._prompt
		};
	}
}

export class BundledMessageNode extends BundledMessageNodeBase<BotTypes> {
	public constructor(protected bot: BotAdapter) {
		super(bot);
	}

	public dispatch() {
		return Promise.resolve({} as any);
	}

	public compose() {
		const content = [];

		if (this._file) {
			content.push({
				type: 'image',
				data: {
					file: this._file,
					name: '我也不知道什么图',
					summary: '我也不知道什么图'
				}
			});
		}
		if (this._text) {
			content.push({
				type: 'text',
				data: {
					text: this._text
				}
			});
		}

		return {
			type: 'node',
			data: {
				nickname: 'AquaDX Bot',
				user_id: this.bot.selfId,
				content
			}
		};
	}
}
