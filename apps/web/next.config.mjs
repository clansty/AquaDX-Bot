import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/5712c57ea7/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === 'development') {
	await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true
	},
	webpack: (config, { isServer }) => {
		config.module.rules.push({
			test: /\.ts$/,
			/*
			Using SWC cause the following error:
			```
			You may need an additional loader to handle the result of these loaders.
			| import dxdataJson from "./dxdata.json";
			|
			> export const dxdata = dxdataJson as DXData;
			|
			| export const dxdataUpdateTime = dxdata.updateTime;
			```
			*/
			use: 'esbuild-loader'
		});
		return config;
	}
};

export default nextConfig;
