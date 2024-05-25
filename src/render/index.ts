import puppeteer, { BrowserWorker } from '@cloudflare/puppeteer';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import warpBasicReactElement from './wrapBasicReactElement';
import { UserMusic, UserRating } from '../types';
import plateProgress from './plateProgress';
import levelProgress from './levelProgress';
import { BA_VE, LEVELS, PLATE_TYPE, PLATE_VER } from '../consts';
import b50 from './b50';

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
		console.timeLog(timer, '图片已生成');
		console.timeEnd(timer);
		page.close().then(browser.close);
		return data;
	}

	private renderReact(element: ReactElement, width: number) {
		return this.renderHtml(renderToStaticMarkup(warpBasicReactElement(element)), width);
	}

	public renderPlateProgress(score: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]) {
		return this.renderReact(plateProgress(score, ver, type), 1500);
	}

	public renderLevelProgress(score: UserMusic[], level: typeof LEVELS[number]) {
		return this.renderReact(levelProgress(score, level), 1500);
	}

	public renderB50(rating: UserRating, userMusic: UserMusic[], username: string, avatar: string) {
		return this.renderReact(b50(rating, userMusic, username, avatar), 2000);
	}
}
