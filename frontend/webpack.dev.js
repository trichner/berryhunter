/**
 * Webpack Configuration used to test in a
 * DEVELOPMENT ENVIRONMENT
 */

const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = env => {
	env = {} || env;
	return merge(common, {
		mode: 'development',
		devtool: 'eval-source-map',
		devServer: {
			contentBase: path.resolve(__dirname, 'dist'),
			// Activate Hot Module Replacement (HMR)
			hot: true,
			port: env.port || 80
		},
	});
};