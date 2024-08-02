import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../types';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const sendB50Image = async (ctx: BotContext) => {
		const profile = await ctx.getCurrentProfile();
		const rating = await profile.getNameplate();
		// 因为只是算 hash 所以 nameplate 就可以

		return await ctx.genCacheSendImage(['b50', rating, ctx.from.id],
			`https://maibot-web.pages.dev/b50/${ctx.from.id}/${ctx.currentProfileId}`,
			2000, 'B50.png', ctx.chat?.type === 'private' ? 'b50' : undefined, false, [
			[{ text: '查看详情', url: `tg://resolve?domain=${ctx.botInfo.username}&appname=webapp&startapp=${encodeURIComponent(btoa(`/b50/${ctx.from.id}/${ctx.currentProfileId}`))}` }]
		]);
	};

	bot.command('b50', sendB50Image);

	bot.start(async (ctx, next) => {
		if (ctx.payload !== 'b50') return next();
		await sendB50Image(ctx);
	});

	bot.inlineQuery(['b50', 'B50'], async (ctx) => {
		const profile = await ctx.getCurrentProfile();
		const rating = await profile.getNameplate();

		const cached = await ctx.getCacheImage(['b50', rating, ctx.from.id]);
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
