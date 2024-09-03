import BotContext from './BotContext';
import { Env } from '../types';
import { BA_VE, PLATE_TYPE, PLATE_VER, Song } from '@clansty/maibot-types';
import { calcProgressText } from '@clansty/maibot-utils';
import { InlineQueryResult } from 'grammy/types';
import { Bot } from 'grammy';
import XXH from 'xxhashjs';

export default (bot: Bot<BotContext>, env: Env) => {
	const sendProgressImage = async (ctx: BotContext, ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '', isFromStart = false) => {
		const profile = await ctx.getCurrentProfile();
		const requiredSongs = (await profile.plateSongs())[ver];
		const userMusic = await profile.getUserMusic(requiredSongs);

		return await ctx.genCacheSendImage([ver, type, userMusic], `https://maibot-web.pages.dev/plateProgress/${ctx.from.id}/${ctx.currentProfileId}/${encodeURIComponent(ver + type)}`,
			1500, `${ver}${type}完成表.png`, ctx.chat?.type === 'private' ? `${ver}${type}` : undefined, isFromStart, [
				[{ text: '查看详情', url: `tg://resolve?domain=${ctx.me.username}&appname=webapp&startapp=${encodeURIComponent(btoa(`/plateProgress/${ctx.from.id}/${ctx.currentProfileId}/${encodeURIComponent(ver + type)}`))}` }]
			]);
	};

	for (const version of [...PLATE_VER, BA_VE] as const) {
		for (const type of version === BA_VE ? [''] as const : PLATE_TYPE) {
			bot.inlineQuery(RegExp(`^ ?\\/?${version} ?${type} ?(进度)?$`), async (ctx) => {
				ctx.transaction('inlineQuery 牌子进度');
				const profile = await ctx.getCurrentProfile();
				if (!profile) {
					await ctx.answerInlineQuery([], {
						button: { text: '请绑定用户', start_parameter: 'bind' },
						is_personal: true
					});
					return;
				}

				const profileVer = await profile.getVersion();
				const requiredSongs = (await profile.plateSongs())[version].map(it => Song.fromId(it, profileVer));
				const text = calcProgressText(await profile.getUserMusic(requiredSongs), version, type, requiredSongs);
				const userMusic = await profile.getUserMusic(requiredSongs);
				const cachedImage = await ctx.getCacheImage([version, type, userMusic]);
				const results: InlineQueryResult[] = [{
					type: 'article',
					id: '0',
					title: `${version}${type}进度`,
					description: '牌子进度 ' + text.split('\n').pop(),
					input_message_content: { message_text: `${version}${type}进度\n\n` + text }
				}];
				let button = undefined;
				if (cachedImage?.type === 'image') results.push({
					type: 'photo',
					id: 'pic',
					photo_file_id: cachedImage.fileId
				});
				else
					button = { text: `生成图表`, start_parameter: XXH.h32(`${version}${type}`, 0xabcd).toString(16) };
				await ctx.answerInlineQuery(results, { is_personal: true, button, cache_time: 10 });
			});

			bot.command('start', async (ctx, next) => {
				ctx.transaction('start 牌子进度');
				if (ctx.match !== XXH.h32(`${version}${type}`, 0xabcd).toString(16)) return next();
				await sendProgressImage(ctx, version, type, true);
			});

			bot.hears(RegExp(`^\\/?${version} ?${type} ?进度$`), async (ctx) => {
				ctx.transaction('牌子进度');
				const profile = await ctx.getCurrentProfile();
				const profileVer = await profile.getVersion();
				const requiredSongs = (await profile.plateSongs())[version].map(it => Song.fromId(it, profileVer));
				await ctx.reply(calcProgressText(await profile.getUserMusic(requiredSongs), version, type, requiredSongs));
			});

			bot.hears(RegExp(`^\\/?${version} ?${type} ?(完成|进度)[图表]$`), async (ctx) => {
				ctx.transaction('牌子完成表');
				await sendProgressImage(ctx, version, type);
			});
		}
	}
}
