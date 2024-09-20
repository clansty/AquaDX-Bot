import { BotTypes, MessageButtonUrl } from '@clansty/maibot-firm';
import { BuilderEnv } from '../botBuilder';
import UserContext from '../UserContext';

export default <T extends BotTypes>({ bot, env, getContext, musicToFile }: BuilderEnv<T>) => {
	const sendB50Image = async (ctx: UserContext<T>, fromId: T['ChatId'], isPrivate: boolean) => {
		const profile = await ctx.getCurrentProfile();
		const rating = await profile.getNameplate();
		// 因为只是算 hash 所以 nameplate 就可以

		return await ctx.genCacheSendImage(['b50', rating, fromId],
			`https://maibot-web.pages.dev/b50/${fromId}/${ctx.currentProfileId}`,
			2000, 'B50.png', isPrivate ? 'b50' : undefined, false, [
				[new MessageButtonUrl('查看详情', `tg://resolve?domain=AquaDXBot&appname=webapp&startapp=${encodeURIComponent(btoa(`/b50/${fromId}/${ctx.currentProfileId}`))}`)]
			]);
	};

	bot.registerCommand('b50', async (event) => {
		await sendB50Image(getContext(event), event.fromId, event.isPrivate);
		return true;
	});

	bot.registerCommand('start', async (event) => {
		if (event.params[0] !== 'b50') return false;
		await sendB50Image(getContext(event), event.fromId, event.isPrivate);
		return true;
	});

	bot.registerInlineQuery(/^b50$/i, async (event) => {
		const ctx = getContext(event);
		const profile = await ctx.getCurrentProfile();
		const rating = await profile.getNameplate();

		const cached = await ctx.getCacheImage(['b50', rating, event.fromId]);
		const answer = event.answer()
			.isPersonal()
			.withCacheTime(10);
		if (cached?.type === 'image') {
			answer.addPhotoResult('0', cached.fileId);
		} else {
			answer.withStartButton('生成 B50 图片', 'b50');
		}
		await answer.dispatch();

		return true;
	});
}
