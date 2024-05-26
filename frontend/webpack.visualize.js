/**
 * Visualize and analyze the Webpack bundle to see which
 * modules are taking up space and which might be duplicates.
 */

const { merge } = require('webpack-merge');
const prod = require('./webpack.prod.js');
const Visualizer = require('webpack-visualizer-plugin2');
const path = require('node:path');

module.exports = merge(prod, {
	plugins: [new Visualizer({
		filename: path.join('..', 'stats', 'statistics.html'),
		throwOnError: true
	})]
});
