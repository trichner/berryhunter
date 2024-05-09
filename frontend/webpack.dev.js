/**
 * Webpack Configuration used to test in a
 * DEVELOPMENT ENVIRONMENT
 */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = env => {
	// Define default environment
	env = merge({
		port: 80,
		proxy: false
	}, env);

	return merge(common, {
		mode: 'development',

		module: {
			rules: [
				// https://webpack.js.org/loaders/less-loader/
				{
					test: /\.less$/,
					use: [{
						loader: 'style-loader' // creates style nodes from JS strings
					}, {
						loader: 'css-loader' // translates CSS into CommonJS
					}, {
						loader: 'less-loader' // compiles Less to CSS
					}]
				},
			],
		},

		devtool: 'eval-source-map',
		devServer: {
			static: {
				directory: path.resolve(__dirname, 'dist')
			},
			// open: true, // Open default browser
			hot: true, // Activate Hot Module Replacement (HMR)
			host: '0.0.0.0',
			port: env.port,
			proxy: env.proxy ? [{
				context: ['/chieftain'],
				target: 'http://localhost:3080',
				pathRewrite: {'^/chieftain': ''}
			}] : [],
		}
	});
};
