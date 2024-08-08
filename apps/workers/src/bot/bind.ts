import BotContext from './BotContext';
import { Env } from '../types';
import { SdgbProxied, UserProfile } from '@clansty/maibot-clients';
import _ from 'lodash';
import { Bot } from 'grammy';

export default (bot: Bot<BotContext>, env: Env) => {
	const handleQueryBind = async (ctx: BotContext) => {
		const profiles = await ctx.getProfiles();
		let bond = '';
		if (profiles.length) {
			bond += `\n\n现在已经绑定 ${profiles.length} 个账号\n使用 /profile 命令来查看已经绑定的账号\n使用 /delprofile 命令可以删除已经绑定的账号`;
		}
		await ctx.replyWithHTML('用法: /bind <code>AquaDX 的用户名</code> 或 <code>国服微信二维码识别出来的文字</code>' + bond);
	};

	bot.command('start', async (ctx, next) => {
		if (ctx.match !== 'bind') return next();
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

		if (!isNaN(Number(param))) { // is number
			await ctx.reply('现在请使用有户名绑定 AquaDX 的账号');
			// profile = await UserProfile.create({ type: 'AquaDX', userId: Number(param) }, env);
		} else if (param.startsWith('SGWCMAI' + 'D') && param.length === 64 + 8 + 12) {
			const client = SdgbProxied.create(env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET);
			try {
				const userId = await client.resolveChime(param);
				profile = await UserProfile.create({ type: 'SDGB', userId }, env);
			} catch (e) {
				await ctx.reply('绑定失败\n' + e.message);
				return;
			}
		} else {
			profile = await UserProfile.create({ type: 'AquaDX-v2', username: param }, env);
		}

		profiles.push(profile);
		const userPreview = await profile.getUserPreview();

		await ctx.saveProfiles(profiles);
		await ctx.selectProfile(profiles.length - 1);
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
					inline_keyboard: profiles.length > 1 ? _.chunk(profiles.map((_, i) => ({
						text: (i + 1).toString(),
						callback_data: `select_profile:${i}`
					})), 4) : []
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

	bot.callbackQuery(/^select_profile:(\d+)$/, async (ctx) => {
		const index = Number(ctx.match[1]);
		await ctx.selectProfile(index);
		await ctx.answerCallbackQuery('切换成功');
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

	bot.command(['delprofile', 'delprofiles', 'rmprofile', 'rmprofiles'], async (ctx) => {
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
						callback_data: `del_profile:${i}`
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

		await ctx.delProfile(index);
		await ctx.reply('删除成功');
	});

	bot.callbackQuery(/^del_profile:(\d+)$/, async (ctx) => {
		const index = Number(ctx.match[1]);
		await ctx.delProfile(index);
		await ctx.answerCallbackQuery('删除成功');
		await ctx.editMessageText(await getProfilesText(ctx), {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: _.chunk((await ctx.getProfiles()).map((_, i) => ({
					text: (i + 1).toString(),
					callback_data: `del_profile:${i}`
				})), 4)
			}
		});
	});
}
