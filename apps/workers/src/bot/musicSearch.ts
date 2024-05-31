import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.inlineQuery(/.+/, async (ctx) => {
		if (ctx.inlineQuery.query.trim() === '') {
			await ctx.answerInlineQuery([]);
		}
		const results = Song.search(ctx.inlineQuery.query.trim().toLowerCase());
		await ctx.answerInlineQuery(results.map(song =>
			song.tgMusicId ?
				{
					type: 'audio',
					audio_file_id: song.tgMusicId,
					id: song.dxId?.toString() || song.title,
					caption: song.display,
					reply_markup: { inline_keyboard: genSongInfoButtons(song) }
				} :
				{
					type: 'photo',
					title: song.title,
					description: song.title,
					id: song.dxId?.toString() || song.title,
					photo_url: song.coverUrl,
					thumbnail_url: song.coverUrl,
					caption: song.display,
					reply_markup: { inline_keyboard: genSongInfoButtons(song) }
				}), { cache_time: 3600 });
	});

	bot.command(['search', 'maimai'], async (ctx) => {
		if (ctx.payload.trim() === '') {
			await ctx.reply('请输入要搜索的歌曲名');
			return;
		}
		const results = Song.search(ctx.payload.trim().toLowerCase());
		if (!results.length) {
			await ctx.reply('找不到匹配的歌');
			return;
		}
		if (results.length > 1) {
			await ctx.reply(`共找到 ${results.length} 个结果：\n\n` + results.map(song => (song.id ? song.id + '. ' : '') + song.title).join('\n'), {
				reply_markup: {
					inline_keyboard: [[
						{ text: '选择结果', switch_inline_query_current_chat: ctx.payload.trim() }
					]]
				}
			});
			return;
		}

		const song = results[0];
		const extra = {
			caption: song.display,
			reply_markup: { inline_keyboard: genSongInfoButtons(song) }
		};
		if (song.tgMusicId) {
			await ctx.replyWithAudio(song.tgMusicId, extra);
		} else {
			await ctx.replyWithPhoto(song.coverUrl, extra);
		}
	});
}
