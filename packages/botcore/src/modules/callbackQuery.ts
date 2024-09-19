import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';
import { BotTypes, MessageButtonCallback, MessageButtonUrl } from '@clansty/maibot-firm';
import { BuilderEnv } from '../botBuilder';

export default <T extends BotTypes>({ bot, env, getContext, musicToFile }: BuilderEnv<T>) => {
	const genSongInfoButtonsWithCachedLyrics = async (song: Song) => {
		const origin = genSongInfoButtons(song);
		const data = await env.KV.get<string>(`lyrics:${song.id}`);
		if (data && data !== 'None') {
			origin.push([new MessageButtonUrl('查看歌词', data)]);
		}
		return origin;
	};

	bot.registerCallbackQuery(/^song:(\d+):(\d)$/, async (event) => {
		const song = Song.fromId(Number(event.match[1]));
		if (!song) return true;

		const chart = song.getChart(Number(event.match[2]));
		if (!chart) return true;

		if (chart.display.length <= 200) {
			await event.answer()
				.withAlert(chart.display)
				.withCacheTime(3600)
				.dispatch();
			return true;
		}
		await event.answer().dispatch();

		await event.editMessage()
			.setButtons(genSongInfoButtons(song))
			.addButtons(new MessageButtonCallback('🔙 返回', `song:${song.dxId}`))
			.setText(song.basicInfo + '\n\n' + chart.display)
			.dispatch();
	});

	bot.registerCallbackQuery(/^song:(\d+)$/, async (event) => {
		const song = Song.fromId(Number(event.match[1]));
		if (!song) return true;

		await event.editMessage()
			.setButtons(await genSongInfoButtonsWithCachedLyrics(song))
			.setText(song.display)
			.dispatch();

		return true;
	});

	bot.registerCallbackQuery(/^song:(\d+):alias$/, async (event) => {
		const song = Song.fromId(Number(event.match[1]));
		if (!song) return true;

		const message = '歌曲别名:\n' + song.searchAcronyms.join(', ');
		if (message.length <= 200) {
			await event.answer()
				.withAlert(message)
				.withCacheTime(3600)
				.dispatch();
			return true;
		}

		await event.answer().dispatch();
		await event.editMessage()
			.setButtons(genSongInfoButtons(song))
			.addButtons(new MessageButtonCallback('🔙 返回', `song:${song.dxId}`))
			.setText(song.basicInfo + '\n\n' + message)
			.dispatch();
		return true;
	});
}
