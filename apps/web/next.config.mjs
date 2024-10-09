const nextConfig = {
	typescript: {
		ignoreBuildErrors: true
	},
	webpack: (config, { isServer, buildId }) => {
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
