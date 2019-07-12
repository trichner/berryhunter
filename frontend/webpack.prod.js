/**
 * Webpack Configuration used to build a
 * PRODUCTIVE DEPLOYMENT
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge.smart(common, {
	mode: 'production',
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new webpack.HashedModuleIdsPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
		new OptimizeCssAssetsPlugin({
			cssProcessorPluginOptions: {
				preset: ['default', {
					discardComments: {removeAll: true}
				}],
			},
		})
	],

	module: {
		rules: [
			{
				test: /\.less$/,
				use: [{
					loader: MiniCssExtractPlugin.loader
				}, {
					loader: 'css-loader' // translates CSS into CommonJS
				}, {
					loader: 'less-loader' // compiles Less to CSS
				}]
			},
		]
	},

	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	}
});