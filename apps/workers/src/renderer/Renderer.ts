import puppeteer from '@cloudflare/puppeteer';

// This should only be used in Queue handler
export default class Renderer {
	public constructor(private readonly browser: puppeteer.Browser) {
	}

	public async renderHtml(url: string, width: number, isUrl = false) {
		console.log('开始渲染图片');
		const timer = crypto.randomUUID();
		console.time(timer);
		const page = await this.browser.newPage();
		await page.setViewport({ width, height: 300 });
		console.timeLog(timer, '页面已创建');
		await page.goto(url, { waitUntil: 'networkidle0' });
		console.timeLog(timer, '页面已加载');
		const data = await page.screenshot({ encoding: 'binary', fullPage: true }) as Buffer;
		// @ts-ignore
		const height = await page.evaluate(() => document.body.scrollHeight) as number;
		console.timeLog(timer, '图片已生成');
		console.timeEnd(timer);
		return { data, width, height };
	}
}
