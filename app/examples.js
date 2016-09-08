const fs = require('fs');
const path = require('path');
const resources = require('./src/utils/resources');

module.exports = function examplesMenu(openExampleCallback) {
	const examplesDir = resources.getPath('examples');
	const menuItems = [];

	for (let filename of fs.readdirSync(examplesDir).sort()) {
		// parse the name
		const match = filename.match(/^[0-9]+ (.*?)(\..+)?$/);

		// ignore anything that doesn't start with a number
		if (!match) continue;

		let name, extension;
		[, name, extension] = match;

		// if it's a tingapp, add that to the menu
		if (extension === '.tingapp') {
	        const filepath = path.join(examplesDir, filename);

			menuItems.push({
				label: `  ${name}`,
				click: () => { openExampleCallback(filepath) },
			})
		} else {
			menuItems.push({
				label: name,
				enabled: false
			})
		}
	}

	return menuItems;
}