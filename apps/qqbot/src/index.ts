import { createLogg, Format, LogLevel, setGlobalFormat, setGlobalLogLevel } from '@guiiai/logg';
import fs from 'fs';
import YAML from 'yaml';
import { BotAdapter } from './adapter/Bot';
import { buildBot } from '@clansty/maibot-core';
import { Env } from './types';
import { LevelKV } from '@clansty/maibot-adapters/src/LevelKV';
import { Renderer } from './adapter/Renderer';
import fusion from './fusion';

fs.mkdirSync('data/cache', { recursive: true });
fs.mkdirSync('data/db', { recursive: true });
const env = YAML.parse(fs.readFileSync('env.yaml', 'utf-8')) as Env;

setGlobalLogLevel(LogLevel[env.LOG_LEVEL]);
setGlobalFormat(Format.Pretty);
const logger = createLogg('main').useGlobalConfig();

process.on('unhandledRejection', (error: any) => {
	logger.withError(error)
		.error('UnhandledRejection');
	console.error(error);
});

process.on('uncaughtException', (error: any) => {
	logger.withError(error)
		.error('UncaughtException');
	console.error(error);
});

env.KV = new LevelKV();
const renderer = new Renderer();

const bot = new BotAdapter(env);
buildBot({
	bot, env,
	musicToFile: {},
	genImage: renderer.renderHtml.bind(renderer),
	enableOfficialServers: false
});
fusion.attachHandlers(bot, env);

logger.log('初始化完成');
