import { createLogg } from '@guiiai/logg';
import puppeteer, { Browser } from 'puppeteer';
import fsP from 'fs/promises';
import path from 'node:path';

export class Renderer {
	private readonly logger = createLogg('Renderer').useGlobalConfig();
	private browser: Browser;

	constructor() {
		puppeteer.launch({ headless: true }).then(browser => {
			this.browser = browser;
			this.logger.log('Puppeteer 加载完毕');
		});
	}

	async renderHtml(url: string, width: number) {
		this.logger.log('开始渲染图片');
		const page = await this.browser.newPage();
		await page.setViewport({ width, height: 300 });
		this.logger.log('页面已创建');
		await page.goto(url, { waitUntil: 'networkidle2' });
		this.logger.log('页面已加载');
		const data = await page.screenshot({ encoding: 'binary', fullPage: true, type: 'jpeg' });
		const filename = path.resolve(`data/cache/${new Date().getTime()}.jpeg`);
		await fsP.writeFile(filename, data);
		const height = await page.evaluate('document.body.scrollHeight') as number;
		page.close();
		this.logger.withField('path', filename).log('图片已生成');
		return { data: filename, height };
	}
}
