// https://www.christiandimas.com/lighter-web-scraping-using-nodejs/
// https://github.com/myrtleTree33/burpple-api-unofficial/blob/master/src/utils/burppleScraper.js

import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import logger from "./logger.js";
import asyncWorker from "./utils/asyncWorker.js";

import * as constants from "./constants.js";

const { SCRAPE_HOST, WISHLIST_URL, WISHLIST_DATAFILE } = constants;

async function scrapeWishlistPage({ page = 1 }) {
	if (page < 0) throw "Page size is negative.";

	const ITEMS_PER_PAGE = 10;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	const url = `${WISHLIST_URL}${offset > 0 ? `?offset=${offset}` : ""}`;
	console.log(url);

	// ? Get HTML of the website
	const response = await axios.get(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37",
		},
	});
	const html = response.data;

	// ? Load HTML to cheerio
	const $ = cheerio.load(html);

	// ? Loop through the product element
	const data = $("div.card.feed-item")
		.map((_, element) => {
			const venueElement = $(element);
			const id = venueElement.find("button.btn--wishBtn").prop("data-venue-id");

			// ? names such as 313 @ Somerset will be protected by cloudflare, so we need another data field
			// const name = venueElement.find("div.searchVenue-header-name span").text();

			const name = venueElement
				.find("button.btn--wishBtn")
				.prop("data-venue-name");
			const href = venueElement
				.find("div.card-item a")
				.prop("href")
				.split("?")[0];

			return {
				id,
				name,
				url: `${SCRAPE_HOST}${href}`,
			};
		})
		.get();

	return data;
}

const burppleWishlistWorker = asyncWorker({
	initialState: {
		numEntries: undefined,
		page: 1,
		// accumulator: [],
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
			const entries = await scrapeWishlistPage({
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
				// accumulator: [...accumulator, ...entries],
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

const burppleWishlistScraperTask = () => {
	logger.info("Started Burpple scraping..");
	burppleWishlistWorker();
};

burppleWishlistScraperTask();
