/**
 * Webpack Configuration used to test in a
 * DEVELOPMENT ENVIRONMENT
 */

const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = env => {
	// Define default environment
	env = merge({
		port: 80,
		proxy: false
	}, env);

	return merge(common, {
		mode: 'development',
		devtool: 'eval-source-map',
		devServer: {
			contentBase: path.resolve(__dirname, 'dist'),
			// Activate Hot Module Replacement (HMR)
			hot: true,
			port: env.port,
			proxy: env.proxy ? {
				'/chieftain': {
					target: 'http://localhost:3080',
					pathRewrite: {'^/chieftain': ''}
				}
			} : {},
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin()
		]
	});
};