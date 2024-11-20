import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

import { component$, useVisibleTask$ } from '@builder.io/qwik';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
	const head = useDocumentHead();
	const loc = useLocation();
	
	useVisibleTask$(()=>{
		// @ts-ignore
		const telegram = window.Telegram;
		telegram.WebApp.expand();
	})

	return (
		<>
			<title>{head.title}</title>

			<meta name="viewport" content="width=device-width, initial-scale=1.0" />

			<link rel="preconnect" href="https://fonts.googleapis.com" />
			{/* @ts-ignore */}
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Noto+Sans+SC:wght@100..900&family=Quicksand:wght@300..700&family=Reddit+Mono:wght@200..900&display=swap" rel="stylesheet" />
			{head.meta.map((m) => (
				<meta key={m.key} {...m} />
			))}

			{head.links.map((l) => (
				<link key={l.key} {...l} />
			))}

			{head.styles.map((s) => (
				<style
					key={s.key}
					{...s.props}
					{...(s.props?.dangerouslySetInnerHTML
						? {}
						: { dangerouslySetInnerHTML: s.style })}
				/>
			))}

			<script src="https://telegram.org/js/telegram-web-app.js"/>

			{head.scripts.map((s) => (
				<script
					key={s.key}
					{...s.props}
					{...(s.props?.dangerouslySetInnerHTML
						? {}
						: { dangerouslySetInnerHTML: s.script })}
				/>
			))}
		</>
	);
});
