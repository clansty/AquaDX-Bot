import BotContext from './BotContext';
import { Env } from '../types';
import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';
import { Bot } from 'grammy';
import { Message } from 'grammy/types';
import LyricsHelper from '../utils/LyricsHelper';

export default (bot: Bot<BotContext>, env: Env) => {
	const genSongInfoButtonsWithCachedLyrics = async (song: Song) => {
		const origin = genSongInfoButtons(song);
		const data = await env.KV.get(`lyrics:${song.id}`);
		if (data && data !== 'None') {
			origin.push([{ text: '查看歌词', url: data }]);
		}
		return { buttons: origin, lyrics: data };
	};

	bot.inlineQuery(/.+/, async (ctx) => {
		ctx.transaction('inlineQuery 歌曲搜索');
		if (ctx.inlineQuery.query.trim() === '') {
			await ctx.answerInlineQuery([]);
		}
		const results = Song.search(ctx.inlineQuery.query.trim().toLowerCase());
		await ctx.answerInlineQuery(await Promise.all(results.map(async song =>
			song.tgMusicId ?
				{
					type: 'audio',
					audio_file_id: song.tgMusicId,
					id: `search:${song.dxId?.toString()}` || song.title,
					caption: song.display,
					reply_markup: { inline_keyboard: (await genSongInfoButtonsWithCachedLyrics(song)).buttons }
				} :
				{
					type: 'photo',
					title: song.title,
					description: song.title,
					id: `search:${song.dxId?.toString()}` || song.title,
					photo_url: song.coverUrl,
					thumbnail_url: song.coverUrl,
					caption: song.display,
					reply_markup: { inline_keyboard: (await genSongInfoButtonsWithCachedLyrics(song)).buttons }
				})), { cache_time: 3600 });
	});

	bot.chosenInlineResult(/^search:(\d+)$/, async (ctx) => {
		ctx.transaction('chosenInlineResult 歌曲搜索');
		console.log('chosenInlineResult', ctx.chosenInlineResult.inline_message_id, ctx.match[1]);
		const song = Song.fromId(parseInt(ctx.match[1]));
		if (!song) return;
		const { buttons, lyrics } = await genSongInfoButtonsWithCachedLyrics(song);
		if (lyrics === 'None') return;
		if (!lyrics) {
			const helper = new LyricsHelper(env.GENIUS_SECRET, env.TELEGRAPH_SECRET, env.DEEPL_AUTH_KEY);
			const lyricsUrl = await helper.getLyricsTelegraf(song);
			await env.KV.put(`lyrics:${song.id}`, lyricsUrl);
			if (lyricsUrl !== 'None') {
				buttons.push([{ text: '查看歌词', url: lyricsUrl }]);
			}
		}
		// 由于可能那个没有歌词按钮的结果被 tg 缓存了，然后要是被触发了两次的话，就算第一次按钮的时候找到了歌词，第二次发出来还会没有歌词按钮
		// 所以这里无论如何都 edit 一次
		// 就算 error 了也没事
		await ctx.api.editMessageReplyMarkupInline(ctx.inlineMessageId, {
			reply_markup: { inline_keyboard: buttons }
		});
	});

	const sendSong = async (ctx: BotContext, song: Song) => {
		if (!song) return;

		const { buttons, lyrics } = await genSongInfoButtonsWithCachedLyrics(song);
		const extra = {
			caption: song.display,
			reply_markup: { inline_keyboard: buttons }
		};
		let message: Message.CommonMessage;
		if (song.tgMusicId) {
			message = await ctx.replyWithAudio(song.tgMusicId, extra);
		} else {
			message = await ctx.replyWithPhoto(song.coverUrl, extra);
		}
		// 异步获取歌词，只在 undefined 的时候
		if (!lyrics) {
			const helper = new LyricsHelper(env.GENIUS_SECRET, env.TELEGRAPH_SECRET, env.DEEPL_AUTH_KEY);
			const lyricsUrl = await helper.getLyricsTelegraf(song);
			await env.KV.put(`lyrics:${song.id}`, lyricsUrl);
			if (lyricsUrl !== 'None') {
				await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
					reply_markup: {
						inline_keyboard: [...buttons, [{ text: '查看歌词', url: lyricsUrl }]]
					}
				});
			}
		}
	};

	bot.command('start', async (ctx, next) => {
		if (!ctx.match.startsWith('song-')) return next();
		ctx.transaction('start 歌曲搜索');
		const song = Song.fromId(parseInt(ctx.match.substring(5)));
		await sendSong(ctx, song);
	});

	bot.command(['search', 'maimai', 's'], async (ctx) => {
		ctx.transaction('歌曲搜索');
		if (ctx.match === '') {
			await ctx.reply('请输入要搜索的歌曲名');
			return;
		}
		const results = Song.search(ctx.match.toLowerCase());
		if (!results.length) {
			await ctx.reply('找不到匹配的歌');
			return;
		}
		if (results.length > 1) {
			await ctx.reply(`共找到 ${results.length} 个结果：\n\n` + results.map(song => (song.id ? song.id + '. ' : '') + song.title).join('\n'), {
				reply_markup: {
					inline_keyboard: [[
						{ text: '选择结果', switch_inline_query_current_chat: ctx.match }
					]]
				}
			});
			return;
		}

		const song = results[0];
		await sendSong(ctx, song);
	});
}
