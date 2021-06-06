import fs from "fs";
import logger from "./logger.js";
import asyncWorker from "./utils/asyncWorker.js";
import { scrapeWishlist } from "./utils/scraperBurpple.js";

import * as constants from "./constants.js";
const { WISHLIST_DATAFILE } = constants;

const burppleWishlistWorker = asyncWorker({
	initialState: {
		numEntries: undefined,
		page: 1,
	},
	maxTimeout: 1000,
	onStart: async () => {
		fs.writeFile(WISHLIST_DATAFILE, "[\n", (error) => {
			if (error) throw error;
		});
	},
	onTriggered: async (prevState = {}) => {
		try {
			const { page } = prevState;

			logger.info(`Scraping page ${page}..`);
			const entries = await scrapeWishlist({
				page,
			});

			// if (page % 5 === 0) {
			//   logger.info(`Scraping page ${page}..`);
			// }

			var stream = fs.createWriteStream(WISHLIST_DATAFILE, { flags: "a" });
			entries.forEach(function (item, index) {
				stream.write(`${JSON.stringify(item)},\n`);
			});
			stream.end();

			console.log(entries[entries.length - 1]);

			return {
				...prevState,
				page: page + 1,
				numEntries: entries.length,
			};
		} catch (e) {
			logger.error(e);
			logger.error(
				"During page scraping, encountered an exception. Routine will now terminate."
			);
		}
	},
	toProceed: async (prevState = {}) => {
		const { numEntries } = prevState;
		return numEntries > 0;
	},
	onEnd: async () => {
		fs.appendFile(WISHLIST_DATAFILE, "]\n", (error) => {
			if (error) throw error;
		});
	},
});

const burppleWishlistTask = () => {
	logger.info("Started Burpple scraping..");
	burppleWishlistWorker();
};

burppleWishlistTask();
