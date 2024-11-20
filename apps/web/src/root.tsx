import { component$ } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";
import {
	QwikCityProvider,
	RouterOutlet,
	ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head";
import "./global.css";

export default component$(() => {
	return (
		<QwikCityProvider>
			<head>
				<meta charset="utf-8" />
				<RouterHead />
			</head>
			<body lang="zh">
			<RouterOutlet />
			</body>
		</QwikCityProvider>
	);
});
