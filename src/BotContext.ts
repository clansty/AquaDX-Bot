import { Context } from 'telegraf';
import AquaApi from './api';
import { UserMusic } from './types';

export default class BotContext extends Context {
	aqua: AquaApi;
	aquaUserId: number;
	userMusic: UserMusic[];
}
