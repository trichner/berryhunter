const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			title: 'BerryHunter',
			xhtml: true
		}),
		new FaviconsWebpackPlugin({
			// Your source logo
			logo: './src/img/logo.png',
			// favicon background color (see https://github.com/haydenbleasel/favicons#usage)
			background: '#fff',
			// favicon app title (see https://github.com/haydenbleasel/favicons#usage)
			title: 'BerryHunter',

			// which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
			icons: {
				android: true,
				appleIcon: true,
				appleStartup: true,
				coast: false,
				favicons: true,
				firefox: false,
				opengraph: true,
				twitter: true,
				yandex: true,
				windows: false
			}
		}),
		new webpack.HotModuleReplacementPlugin()
	],
	output: {
		filename: 'game.js',
		path: path.resolve(__dirname, 'dist')
	},

	resolve: {
		// Add '.ts' as resolvable extensions.
		extensions: ['.ts', '.js']
	},

	module: {
		rules: [
			// All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
			{test: /\.ts$/, loader: 'awesome-typescript-loader'},

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
					limit: 10000
				}
			}
		]
	},

	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: {}
};