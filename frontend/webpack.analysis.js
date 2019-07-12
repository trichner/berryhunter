/**
 * Webpack Configuration used to
 * ANALYZE THE PROJECT
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = merge(common, {
	mode: 'production',
	plugins: [
		new CircularDependencyPlugin({
			// exclude detection of files based on a RegExp
			exclude: /node_modules/,
			// add errors to webpack instead of warnings
			failOnError: true,
			// allow import cycles that include an asyncronous import,
			// e.g. via import(/* webpackMode: "weak" */ './file.js')
			allowAsyncCycles: false,
			// set the current working directory for displaying module paths
			cwd: process.cwd(),
		})
	]
});