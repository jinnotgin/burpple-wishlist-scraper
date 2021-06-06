// https://www.christiandimas.com/lighter-web-scraping-using-nodejs/
// https://github.com/myrtleTree33/burpple-api-unofficial/blob/master/src/utils/burppleScraper.js

import axios from "axios";
import cheerio from "cheerio";

import * as constants from "../constants.js";
const { SCRAPE_HOST, WISHLIST_URL } = constants;

export const scrapeWishlist = async ({ page = 1 }) => {
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
};
