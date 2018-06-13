const fs = require('fs-extra');
const path = require('path');

const dts = require('ts-declarator').default;

const log = require('./common');


async function definition() {
	log.bold('> definition.js');

	const CWD = process.cwd();
	const PKG = await fs.readJson(path.join(CWD, 'package.json'));
	const DEF_FILE = path.join(CWD, 'typings', 'app.d.ts');
	const config = {
		name: `${PKG.name}/dist`,
		project: CWD,
		out: DEF_FILE,
		sendMessage: console.log,
		externs: ['./global.d.ts'],
		exclude: ['test/**/*.*']
	};

	await fs.remove(DEF_FILE);
	await dts(config);

	const content = await fs.readFile(DEF_FILE, 'utf8');

	const newContent = content.replace(/([\t\f\v]*)private(.*);[\r\n]*/g, '')
		.replace(/\/src\//g, '/dist/')
		.replace(/\/dist\/app\/index'/g, "'")

	await fs.writeFile(DEF_FILE, newContent);
	log.success('Definition generated');
}

// If required by another file
if (module.parent) {
	module.exports = definition;
} else { // If executed from terminal
	definition();
}