const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const FaviconWebpackPlugin = require('favicons-webpack-plugin');


module.exports = {
	entry: './src/index.ts',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'BerryHunter',
			xhtml: true
		}),
		new FaviconWebpackPlugin({
			logo: './src/img/logo.svg',
			publicPath: '.',
			prefix: '',
			inject: true,
			favicons: {
				appName: 'BerryHunter',
				appDescription: 'A 2D multiplayer stone age survival game',
				developerName: 'Team Dodo',
				developerURL: 'https://berryhunter.io',
				display: 'fullscreen',
				orientation: 'landscape',
				start_url: '',
				theme_color: '#E66CEF',
				version: 'Open Beta'
			}
		}),
	],

	resolve: {
		// Add '.ts' as resolvable extensions.
		extensions: ['.ts', '.js'],
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},

			{
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: true,
					}
				}],
			},

			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},

			{
				test: /\.svg$/,
				type: 'asset/inline',
				generator: {
					dataUrl: content => svgToMiniDataURI(content.toString()),
				},
			},

			// https://webpack.js.org/guides/asset-modules/#resource-assets
			{
				test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
				resourceQuery: { not: [/raw/] },
				type: 'asset',
			},

			{
				test: /\.(mustache)$/,
				type: 'asset/source'
			},

			{
				resourceQuery: /raw/,
				type: 'asset/source',
			},

			{
				test: /\.mp3$/,
				type: 'asset/resource'
			}
		]
	},

	output: {
		filename: '[name].[fullhash].js',
		path: path.resolve(__dirname, 'dist')
	},
};
