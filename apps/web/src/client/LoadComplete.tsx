'use client';

import React from 'react';
import Script from 'next/script';

export default () => {
	return <Script src="https://telegram.org/js/telegram-web-app.js" onLoad={() => {
		// @ts-ignore
		const telegram = window.Telegram;
		console.log(telegram);
		telegram.WebApp.expand();
	}} />;
}
