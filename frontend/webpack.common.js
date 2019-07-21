const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'BerryHunter',
			xhtml: true
		}),
		new WebappWebpackPlugin({
			logo: './src/img/logo.svg',
			publicPath: '.',
			prefix: '',
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
		})
	],

	resolve: {
		// Add '.ts' as resolvable extensions.
		extensions: ['.ts', '.js']
	},

	module: {
		rules: [
			// All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
			{test: /\.ts$/, loader: 'awesome-typescript-loader'},

			{
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						interpolate: 'require', // used to require other html partials inside of html
						minimize: true,
					}
				}]
			},

			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},

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

			// embed small PNG/JPG/GIF/SVG images as well as fonts as Data URLs
			// and copy larger files to the output directory.
			{
				test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
				loader: 'url-loader',
				options: {
					limit: 249856 // 244 KiB
				}
			}
		]
	},

	output: {
		filename: '[name].[hash].js',
		path: path.resolve(__dirname, 'dist')
	},
};