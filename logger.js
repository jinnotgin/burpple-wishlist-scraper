// https://github.com/myrtleTree33/burpple-api-unofficial/blob/master/src/logger.js

import appRoot from "app-root-path";
import winston from "winston";

const options = {
	file: {
		level: "info",
		filename: `${appRoot}/logs/app.log`,
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false,
	},
	console: {
		level: "debug",
		handleExceptions: true,
		json: false,
		colorize: true,
	},
};

const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [
		new winston.transports.File(options.file),
		new winston.transports.Console(options.console),
	],
});

export default logger;
