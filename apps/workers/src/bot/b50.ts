import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';
import { InlineKeyboardButton } from 'telegraf/types';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const sendB50Image = async (ctx: BotContext) => {
		const userPreview = await ctx.getUserPreview();
		const [userMusic, rating] = await Promise.all([ctx.getUserMusic(), ctx.getUserRating()]);

		const inlineKeyboard: InlineKeyboardButton[][] = [
			[{ text: '查看详情', url: `tg://resolve?domain=${ctx.botInfo.username}&appname=webapp&startapp=${encodeURIComponent(btoa(`/b50/${ctx.from.id}`))}` }]
		];
		if (ctx.chat?.type === 'private') {
			inlineKeyboard.push([{ text: '分享', switch_inline_query: 'b50' }]);
		}
		return await ctx.genCacheSendImage(['b50', rating, ctx.from.id], async () => {
			let avatar = await ctx.telegram.getUserProfilePhotos(ctx.from.id, 0, 1).then(it => it.photos[0]?.[0].file_id);
			if (avatar) {
				avatar = (await ctx.telegram.getFileLink(avatar)).toString();
			} else {
				avatar = 'https://nyac.at/api/telegram/avatar/' + ctx.from.id;
				const res = await fetch(avatar, { method: 'HEAD' });
				if (!res.ok) avatar = '';
			}

			return await new Renderer(env.MYBROWSER).renderB50(rating, userMusic, userPreview.userName, avatar);
		}, 'B50.png', {
			inline_keyboard: inlineKeyboard
		});
	};

	bot.command('b50', sendB50Image);

	bot.start(async (ctx, next) => {
		if (ctx.payload !== 'b50') return next();
		await sendB50Image(ctx);
	});

	bot.inlineQuery(['b50', 'B50'], async (ctx) => {
		const userPreview = await ctx.getUserPreview();
		if (!userPreview?.userName) {
			await ctx.answerInlineQuery([], {
				button: { text: '请绑定用户', start_parameter: 'bind' },
				is_personal: true
			});
			return;
		}
		const [userMusic, rating] = await Promise.all([ctx.getUserMusic(), ctx.getUserRating()]);

		const cached = await ctx.getCacheImage(['b50', userMusic, userPreview.userName, ctx.from.id]);
		if (cached?.type === 'image') {
			await ctx.answerInlineQuery([{
				type: 'photo',
				id: '0',
				photo_file_id: cached.fileId
			}], { is_personal: true });
			return;
		}

		await ctx.answerInlineQuery([], {
			button: { text: '生成 B50 图片', start_parameter: 'b50' },
			is_personal: true,
			cache_time: 10
		});
	});
}
