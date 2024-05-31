import { Telegraf } from 'telegraf';
import BotContext from '../classes/BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.command('b50', async (ctx) => {
		const genMsg = ctx.reply('图片生成中...');

		const userMusic = await ctx.getUserMusic();
		const rating = await ctx.getUserRating();
		const userPreview = await ctx.getUserPreview();

		let avatar = await ctx.telegram.getUserProfilePhotos(ctx.from.id, 0, 1).then(it => it.photos[0]?.[0].file_id);
		if (avatar) {
			avatar = (await ctx.telegram.getFileLink(avatar)).toString();
		} else {
			avatar = 'https://nyac.at/api/telegram/avatar/' + ctx.from.id;
			const res = await fetch(avatar, { method: 'HEAD' });
			if (!res.ok) avatar = '';
		}

		await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderB50(rating, userMusic, userPreview.userName, avatar), filename: 'B50.png' });
		await ctx.deleteMessage((await genMsg).message_id);
	});
}
