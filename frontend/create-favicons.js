const fs = require('fs');
const path = require('path');
const del = require('del');
const favicons = require('favicons');

const source = './src/img/logo.svg';                     // Source image(s). `string`, `buffer` or array of `string`
const faviconsDir = './favicons';

const configuration = {
	// Path for overriding default icons path. `string`
	path: '/',
	// Your application's name. `string`
	appName: 'BerryHunter',
	// Your application's description. `string`
	appDescription: 'The most awesome berry-hunting experience',
	// Your (or your developer's) name. `string`
	developerName: 'Team Dodo',
	// Background color for flattened icons. `string`
	background: '#fff',
	// Theme color user for example in Android's task switcher. `string`
	theme_color: '#E66CEF',
	// Preferred display mode: 'fullscreen', 'standalone', 'minimal-ui' or 'browser'. `string`
	display: 'fullscreen',
	// Default orientation: 'any', 'natural', 'portrait' or 'landscape'. `string`
	orientation: 'landscape',
	// set of URLs that the browser considers within your app
	scope: '/',
	// Start URL when launching the application from a device. `string`
	start_url: '/',
	icons: {
		// Platform Options:
		// - offset - offset in percentage
		// - background:
		//   * false - use default
		//   * true - force use default, e.g. set background for Android icons
		//   * color - set background for the specified icons
		//   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
		//   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
		//   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
		//
		android: false,              // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		appleIcon: false,            // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		appleStartup: false,         // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		coast: false,                // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		favicons: true,             // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		firefox: false,              // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		windows: false,              // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
		yandex: false                // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
	}
};

/**
 *
 * @param error
 * @param response
 * @param response.images Array of { name: string, contents: <buffer> }
 * @param response.files Array of { name: string, contents: <string> }
 * @param response.html Array of strings (html elements)
 */
function callback(error, response) {
	if (error) {
		console.log(error.message); // Error description e.g. 'An unknown error has occurred'
		return;
	}

	console.log('Delete folder.');
	del([faviconsDir + '/**']).then(function () {
		console.log('Make folder.');
		fs.mkdirSync(faviconsDir);
		console.log('Write images.');
		response.images.forEach(function (file) {
			fs.writeFileSync(path.resolve(faviconsDir, file.name), file.contents);
		});
		console.log('Write files.');
		response.files.forEach(function (file) {
			fs.writeFileSync(path.resolve(faviconsDir, file.name), file.contents);
		});

		fs.writeFileSync(path.resolve(faviconsDir, 'favicons.html'), response.html.join('\n'));
	});
}

favicons(source, configuration, callback);