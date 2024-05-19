import puppeteer, { BrowserWorker } from '@cloudflare/puppeteer';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import warpBasicReactElement from './wrapBasicReactElement';
import { UserMusic } from '../types';
import baveProgress from './baveProgress';
import levelProgress from './levelProgress';
import { LEVELS } from '../consts';

export default class Renderer {
	constructor(private readonly browser: BrowserWorker) {
	}

	private async renderHtml(html: string, width: number) {
		const browser = await puppeteer.launch(this.browser);
		const page = await browser.newPage();
		await page.setViewport({ width, height: 300 });
		await page.setContent(html, { waitUntil: 'networkidle0' });
		const data = await page.screenshot({ encoding: 'binary', fullPage: true }) as Buffer;
		page.close().then(browser.close);
		return data;
	}

	private renderReact(element: ReactElement, width: number) {
		return this.renderHtml(renderToStaticMarkup(warpBasicReactElement(element)), width);
	}

	public renderBaVeProgress(score: UserMusic[]) {
		return this.renderReact(baveProgress(score), 1500);
	}

	public renderLevelProgress(score: UserMusic[], level: typeof LEVELS[number]) {
		return this.renderReact(levelProgress(score, level), 1500);
	}
}
