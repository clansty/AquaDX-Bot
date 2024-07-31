import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../types';
import { SdgbProxied, UserProfile } from '@clansty/maibot-clients';
import _ from 'lodash';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const handleQueryBind = async (ctx: BotContext) => {
		const profiles = await ctx.getProfiles();
		let bond = '';
		if (profiles.length) {
			bond += `\n\n现在已经绑定 ${profiles.length} 个账号\n使用 /profile 命令来查看已经绑定的账号`;
		}
		await ctx.reply('用法: /bind <AquaDX 的“账户卡”号码> 或 <国服微信二维码识别出来的文字>' + bond);
	};

	bot.start(async (ctx, next) => {
		if (ctx.payload !== 'bind') return next();
		await handleQueryBind(ctx);
	});

	bot.command('bind', async (ctx) => {
		if (ctx.chat.type !== 'private') {
			await ctx.reply('请在私聊中使用此命令');
			return;
		}

		const profiles = await ctx.getProfiles();

		if (ctx.args.length < 1) {
			await handleQueryBind(ctx);
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
		let text = `成功绑定用户 ${userPreview.userName}，DX Rating ${userPreview.playerRating}\n账号槽位 ${profiles.length}\n\n使用 /profile 命令来查看已经绑定的账号`;
		if (profiles.length > 1) {
			text += `\n使用 "/profile <槽位ID>" 来切换当前选择的账号`;
		}
		await ctx.reply(text);
	});

	const getProfilesText = async (ctx: BotContext) => {
		const profiles = await ctx.getProfiles();
		const current = await ctx.getCurrentProfile(false);

		const text = await Promise.all(
			profiles.map(async (p, i) => {
				const text = `${i + 1}. ${p.type} ${p.userId}`;
				if (p === current) {
					return `<b>${text}</b> (选中)`;
				}
				return text;
			}));

		return text.join('\n');
	};

	bot.command(['profile', 'profiles'], async (ctx) => {
		const profiles = await ctx.getProfiles();
		if (!profiles.length) {
			await ctx.reply('请先绑定用户');
			return;
		}

		if (!ctx.args.length) {
			if (ctx.chat.type !== 'private') {
				await ctx.reply('请在私聊中使用此命令');
				return;
			}
			await ctx.replyWithHTML(await getProfilesText(ctx), {
				reply_markup: {
					inline_keyboard: _.chunk(profiles.map((_, i) => ({
						text: (i + 1).toString(),
						callback_data: `select_profile:${i}`
					})), 4)
				}
			});
			return;
		}

		const index = Number(ctx.args[0]) - 1;
		if (isNaN(index) || index < 0 || index >= profiles.length) {
			await ctx.reply('槽位不存在');
			return;
		}

		await ctx.selectProfile(index);
		await ctx.reply('切换成功');
	});

	bot.action(/^select_profile:(\d+)$/, async (ctx) => {
		const index = Number(ctx.match[1]);
		await ctx.selectProfile(index);
		await ctx.answerCbQuery('切换成功');
		await ctx.editMessageText(await getProfilesText(ctx), {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: _.chunk((await ctx.getProfiles()).map((_, i) => ({
					text: (i + 1).toString(),
					callback_data: `select_profile:${i}`
				})), 4)
			}
		});
	});
}
