import { Env } from '../types';
import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { DurableObjectState } from '@cloudflare/workers-types';

// 渲染过程（打开 Page）应该是可以并行的，所以这个更应该用 Durable object 而不是 queue

const KEEP_BROWSER_ALIVE_IN_SECONDS = 300;

export class Renderer implements DurableObject {
	keptAliveInSeconds = 0;
	browser: Browser;

	constructor(private readonly state: DurableObjectState, private readonly env: Env) {
	}

	async fetch(request: Request) {
		try {
			const { url, width } = await request.json() as { url: string, width: number };
			const result = await this.renderHtml(url, width);

			// Reset keptAlive after performing tasks to the DO.
			this.keptAliveInSeconds = 0;

			return new Response(result.data, {
				headers: {
					'Content-Type': 'image/png',
					height: result.height.toString()
				}
			});
		} catch (e) {
			return new Response(e.message, { status: 500 });
		}
	}

	async getPage() {
		//if there's a browser session open, re-use it
		if (!this.browser || !this.browser.isConnected()) {
			console.log(`Browser DO: Starting new instance`);
			try {
				this.browser = await puppeteer.launch(this.env.MYBROWSER);
			} catch (e) {
				console.log(`Browser DO: Could not start browser instance. Error: ${e}`);
				throw e;
			}
		}

		// Reset keptAlive after each call to the DO
		this.keptAliveInSeconds = 0;

		// set the first alarm to keep DO alive
		let currentAlarm = await this.state.storage.getAlarm();
		if (currentAlarm == null) {
			console.log(`Browser DO: setting alarm`);
			const TEN_SECONDS = 10 * 1000;
			await this.state.storage.setAlarm(Date.now() + TEN_SECONDS);
		}

		return await this.browser.newPage();
	}

	async renderHtml(url: string, width: number) {
		console.log('开始渲染图片');
		const page = await this.getPage();
		await page.setViewport({ width, height: 300 });
		console.log(new Date(), '页面已创建');
		await page.goto(url, { waitUntil: 'networkidle2' });
		console.log(new Date(), '页面已加载');
		const data = await page.screenshot({ encoding: 'binary', fullPage: true, type: 'jpeg' }) as Buffer;
		const height = await page.evaluate('document.body.scrollHeight') as number;
		console.log(new Date(), '图片已生成');

		this.state.waitUntil(page.close()); // async
		return { data, width, height };
	}

	async alarm() {
		this.keptAliveInSeconds += 10;

		// Extend browser DO life
		if (this.keptAliveInSeconds < KEEP_BROWSER_ALIVE_IN_SECONDS) {
			console.log(`Browser DO: has been kept alive for ${this.keptAliveInSeconds} seconds. Extending lifespan.`);
			await this.state.storage.setAlarm(Date.now() + 10 * 1000);
			// You could ensure the ws connection is kept alive by requesting something
			// or just let it close automatically when there  is no work to be done
			// for example, `await this.browser.version()`
			await this.browser.version();
		} else {
			console.log(`Browser DO: exceeded life of ${KEEP_BROWSER_ALIVE_IN_SECONDS}s.`);
			if (this.browser) {
				console.log(`Closing browser.`);
				await this.browser.close();
			}
		}
	}
}
