// Import
import chalk from "chalk";

const PROJECT_NAME = process.env.PROJECT_NAME;

// Export
export default class Logger {

	static info(content: string) {
		console.log(`${chalk.magenta(`{${PROJECT_NAME}}`)} ${content}`);
	};

	static success(content: string) {
		console.log(`${chalk.green(`{${PROJECT_NAME}}`)} ${content}`);
	};

	static error(content: string) {
		console.log(`${chalk.red(`{${PROJECT_NAME}}`)} ${content}`);
	};

	static debug(content: string) {
		console.log(`${chalk.yellow(`{${PROJECT_NAME}}`)} ${content}`);
	};

	static separator() {
		console.log(chalk.black("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="));
	};
};