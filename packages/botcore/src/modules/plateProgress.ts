import { BA_VE, PLATE_TYPE, PLATE_VER, Song } from '@clansty/maibot-types';
import { calcProgressText } from '@clansty/maibot-utils';
import XXH from 'xxhashjs';
import { BotTypes, MessageButtonUrl } from '@clansty/maibot-firm';
import { BuilderEnv } from '../botBuilder';
import UserContext from '../UserContext';

export default <T extends BotTypes>({ bot, env, getContext, musicToFile }: BuilderEnv<T>) => {
	const sendProgressImage = async (ctx: UserContext<T>, fromId: T['ChatId'], isPrivate: boolean, ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '', isFromStart = false) => {
		const profile = await ctx.getCurrentProfile();
		const requiredSongs = (await profile.plateSongs())[ver];
		const userMusic = await profile.getUserMusic(requiredSongs);

		return await ctx.genCacheSendImage([ver, type, userMusic], `https://maibot-web.pages.dev/plateProgress/${fromId}/${ctx.currentProfileId}/${encodeURIComponent(ver + type)}`,
			1500, `${ver}${type}完成表.png`, isPrivate ? `${ver}${type}` : undefined, isFromStart, [
				[new MessageButtonUrl('查看详情', `tg://resolve?domain=AquaDXBot&appname=webapp&startapp=${encodeURIComponent(btoa(`/plateProgress/${fromId}/${ctx.currentProfileId}/${encodeURIComponent(ver + type)}`))}`)]
			]);
	};

	for (const version of [...PLATE_VER, BA_VE] as const) {
		for (const type of version === BA_VE ? [''] as const : PLATE_TYPE) {
			bot.registerInlineQuery(RegExp(`^ ?\\/?${version} ?${type} ?(进度)?$`), async (event) => {
				const ctx = getContext(event.fromId);
				const profile = await ctx.getCurrentProfile();
				if (!profile) {
					await event.answer()
						.withStartButton('请绑定用户', 'bind')
						.isPersonal()
						.dispatch();
					return true;
				}

				const profileVer = await profile.getVersion();
				const requiredSongs = (await profile.plateSongs())[version].map(it => Song.fromId(it, profileVer));
				const text = calcProgressText(await profile.getUserMusic(requiredSongs), version, type, requiredSongs);
				const userMusic = await profile.getUserMusic(requiredSongs);
				const cachedImage = await ctx.getCacheImage([version, type, userMusic]);
				const answer = event.answer()
					.isPersonal()
					.withCacheTime(10);
				answer.addTextResult('0', `${version}${type}进度`)
					.setDescription('牌子进度 ' + text.split('\n').pop())
					.setText(`${version}${type}进度\n\n` + text);
				if (cachedImage?.type === 'image')
					answer.addPhotoResult('pic', cachedImage.fileId);
				else
					answer.withStartButton('生成图表', XXH.h32(`${version}${type}`, 0xabcd).toString(16));
				await answer.dispatch();
				return true;
			});

			bot.registerCommand('start', async (event) => {
				if (event.params[0] !== XXH.h32(`${version}${type}`, 0xabcd).toString(16)) return false;
				const ctx = getContext(event.fromId);
				await sendProgressImage(ctx, event.fromId, event.isPrivate, version, type, true);
			});

			bot.registerKeyword(RegExp(`^\\/?${version} ?${type} ?进度$`), async (event) => {
				const ctx = getContext(event.fromId);
				const profile = await ctx.getCurrentProfile();
				const profileVer = await profile.getVersion();
				const requiredSongs = (await profile.plateSongs())[version].map(it => Song.fromId(it, profileVer));
				await event.reply()
					.setText(calcProgressText(await profile.getUserMusic(requiredSongs), version, type, requiredSongs))
					.dispatch();
				return true;
			});

			bot.registerKeyword(RegExp(`^\\/?${version} ?${type} ?(完成|进度)[图表]$`), async (event) => {
				const ctx = getContext(event.fromId);
				await sendProgressImage(ctx, event.fromId, event.isPrivate, version, type);
				return true;
			});
		}
	}
}
