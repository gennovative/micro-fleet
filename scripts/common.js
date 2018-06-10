const chalk = require('chalk');

module.exports = {
	bold: (...msg) => console.log(chalk.bold(...msg)),
	error: (...msg) => console.log(chalk.bold.red('error'), ...msg),
	warning: (...msg) => console.log(chalk.bold.yellow('warning'), ...msg),
	info: (...msg) => console.log(chalk.bold.blue('info'), ...msg),
	success: (...msg) => console.log(chalk.bold.green('success'), ...msg),
}