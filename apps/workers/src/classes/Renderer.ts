import puppeteer, { BrowserWorker } from '@cloudflare/puppeteer';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BA_VE, LEVELS, PLATE_TYPE, PLATE_VER, UserMusic, UserRating } from '@clansty/maibot-types';
import wrapBasicReactElement from '../utils/wrapBasicReactElement';
import { b50, levelProgress, plateProgress } from '@clansty/maibot-components';

export default class Renderer {
	constructor(private readonly browser: BrowserWorker) {
	}

	private async renderHtml(html: string, width: number) {
		console.log('开始渲染图片');
		const timer = crypto.randomUUID();
		console.time(timer);
		const browser = await puppeteer.launch(this.browser);
		console.timeLog(timer, '浏览器已启动');
		const page = await browser.newPage();
		await page.setViewport({ width, height: 300 });
		console.timeLog(timer, '页面已创建');
		await page.setContent(html, { waitUntil: 'networkidle0' });
		console.timeLog(timer, '页面已加载');
		const data = await page.screenshot({ encoding: 'binary', fullPage: true }) as Buffer;
		// @ts-ignore
		const height = await page.evaluate(() => document.body.scrollHeight) as number;
		console.timeLog(timer, '图片已生成');
		console.timeEnd(timer);
		await browser.close();
		return { data, width, height };
	}

	private renderReact(element: ReactElement, width: number) {
		return this.renderHtml(renderToStaticMarkup(wrapBasicReactElement(element)), width);
	}

	public renderPlateProgress(score: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '') {
		return this.renderReact(plateProgress(score, ver, type), 1500);
	}

	public renderLevelProgress(level: typeof LEVELS[number], score: UserMusic[] = []) {
		return this.renderReact(levelProgress(score, level), 1500);
	}

	public renderB50(rating: UserRating, userMusic: UserMusic[], username: string, avatar: string) {
		return this.renderReact(b50(rating, userMusic, username, avatar), 2000);
	}
}
