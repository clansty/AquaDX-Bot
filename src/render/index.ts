import puppeteer, { BrowserWorker } from '@cloudflare/puppeteer';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import warpBasicReactElement from './warpBasicReactElement';
import { UserMusic } from '../types';
import baveProgress from './baveProgress';

export default class Renderer {
	constructor(private readonly browser: BrowserWorker) {
	}

	public async renderHtml(html: string, width: number) {
		const browser = await puppeteer.launch(this.browser);
		const page = await browser.newPage();
		await page.setViewport({ width, height: 500 });
		await page.setContent(html, { waitUntil: 'networkidle0' });
		const data = await page.screenshot({ encoding: 'binary', fullPage: true }) as Buffer;
		await page.close();
		await browser.close();
		return data;
	}

	public renderReact(element: ReactElement, width: number) {
		return this.renderHtml(renderToStaticMarkup(warpBasicReactElement(element)), width);
	}

	public renderBaVeProgress(score: UserMusic[]) {
		return this.renderReact(baveProgress(score), 1500);
	}
}
