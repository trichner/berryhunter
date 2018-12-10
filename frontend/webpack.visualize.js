/**
 * Visualize and analyze the Webpack bundle to see which
 * modules are taking up space and which might be duplicates.
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = merge(common, {
	mode: 'production',
	plugins: [new Visualizer()]
});