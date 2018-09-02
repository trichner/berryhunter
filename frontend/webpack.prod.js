/**
 * Webpack Configuration used to build a
 * PRODUCTIVE DEPLOYMENT
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
});