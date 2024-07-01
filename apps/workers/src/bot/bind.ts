import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import { UserProfile } from '../models/UserProfile';
import SdgbProxied from '@clansty/maibot-clients/src/SdgbProxied';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.start(async (ctx, next) => {
		if (ctx.payload !== 'bind') return next();
		await ctx.reply('bind test');
	});

	bot.command('bind', async (ctx) => {
		const profiles = await ctx.getProfiles();

		if (ctx.args.length < 1) {
			let bond = '';
			if (profiles.length) {
				bond += `\n\n现在已经绑定 ${profiles.length} 个账号\n使用 /profile 命令来查看已经绑定的账号`;
			}
			await ctx.reply('请输入要绑定的 ID 或 Chime' + bond);
			return;
		}

		const param = ctx.args[0];
		let profile: UserProfile;

		if (!isNaN(Number(param))) {
			profile = await UserProfile.create({ type: 'AquaDX', userId: Number(param) }, env);
		} else if (param.startsWith('SGWCMAI' + 'D')) {
			const client = SdgbProxied.create(env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET);
			try {
				const userId = await client.resolveChime(param);
				profile = await UserProfile.create({ type: 'SDGB', userId }, env);
			} catch (e) {
				await ctx.reply('绑定失败\n' + e.message);
				return;
			}
		} else {
			await ctx.reply('我也不知道你输了什么，反正我绑不了');
			return;
		}

		profiles.push(profile);
		const userPreview = await profile.getUserPreview();

		await ctx.saveProfiles(profiles);
		let text = `成功绑定用户 ${userPreview.userName}，账号槽位 ${profiles.length}\n\n使用 /profile 命令来查看已经绑定的账号`;
		if(profiles.length>1){
			text+= `\n使用 "/profile <槽位ID>" 来切换当前选择的账号`;
		}
		await ctx.reply(text);
	});
}
