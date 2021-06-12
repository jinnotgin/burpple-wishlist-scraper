import logger from "./logger.js";
import asyncWorker from "./utils/asyncWorker.js";
import { scrapeWishlist } from "./utils/scraperBurpple.js";
import JsonFileStream from "./utils/jsonFileStream.js";

import * as constants from "./constants.js";
const { WISHLIST_DATAFILE } = constants;

const wishlist_fileStream = new JsonFileStream(WISHLIST_DATAFILE);

const burppleWishlistWorker = (onEndTrigger = () => {}) => {
	const options = {
		initialState: {
			numEntries: undefined,
			page: 1,
		},
		maxTimeout: 1000,
		onStart: async () => {
			wishlist_fileStream.init();
		},
		onTriggered: async (prevState = {}) => {
			try {
				const { page } = prevState;

				logger.info(`Scraping page ${page}..`);
				const entries = await scrapeWishlist({
					page,
				});

				console.log(entries[entries.length - 1]);

				// if (page % 5 === 0) {
				//   logger.info(`Scraping page ${page}..`);
				// }

				await wishlist_fileStream.append(entries);

				return {
					...prevState,
					page: page + 1,
					numEntries: entries.length,
				};
			} catch (e) {
				logger.error(e);
				logger.error(
					"During wishlist scraping, encountered an exception. Routine will now terminate."
				);
			}
		},
		toProceed: async (prevState = {}) => {
			const { numEntries } = prevState;
			return numEntries > 0;
		},
		onEnd: async () => {
			wishlist_fileStream.end();
			onEndTrigger();
		},
	};
	const worker = asyncWorker(options);
	worker();
};

const burppleWishlistTask = (onEndTrigger = () => {}) => {
	logger.info("Started Burpple wishlist scraping..");
	burppleWishlistWorker(onEndTrigger);
};

export default burppleWishlistTask;
