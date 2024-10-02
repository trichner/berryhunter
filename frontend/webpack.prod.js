/**
 * Webpack Configuration used to build a
 * PRODUCTIVE DEPLOYMENT
 */

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
	mode: 'production',
	plugins: [
		new webpack.ids.HashedModuleIdsPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
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

	output: {
		clean: true,
	},

	optimization: {
		minimizer: [
			`...`,
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: [
						'default',
						{
							discardComments: {removeAll: true},
						},
					],
				},
			}),
		],
		moduleIds: 'deterministic',
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
