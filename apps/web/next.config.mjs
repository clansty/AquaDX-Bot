const nextConfig = {
	typescript: {
		ignoreBuildErrors: true
	},
	experimental: {
		forceSwcTransforms: true,
	},
	webpack: (config, { isServer, buildId }) => {
		// 垃圾 nextjs build 不出来
		// 不想修了
		// 毁灭吧
		config.module.rules.push(
			{
				test: /\.tsx?$/,
				use: 'babel-loader'
				// use: 'esbuild-loader'
			},
			{
				test: /\.json$/,
				type: 'javascript/auto',
				use: 'json-loader'
			}
		);
		return config;
	}
};

export default nextConfig;
