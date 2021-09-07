// https://www.christiandimas.com/lighter-web-scraping-using-nodejs/
// https://github.com/myrtleTree33/burpple-api-unofficial/blob/master/src/utils/burppleScraper.js

import axios from "axios";
import cheerio from "cheerio";
import scrapeRequestHeader from "./scrapeRequestHeader.js";
import Queue from "./queue.js";

import * as constants from "../constants.js";
const { SCRAPE_HOST, wishlistUrl } = constants;

export const scrapeWishlist = async ({ page = 1, username = "" }) => {
	if (page < 0) throw "Page size is negative.";

	const ITEMS_PER_PAGE = 10;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	const WISHLIST_URL = wishlistUrl(username);
	const url = `${WISHLIST_URL}${offset > 0 ? `?offset=${offset}` : ""}`;
	console.log(url);

	// ? Get HTML of the website
	const response = await Queue.enqueue(
		async () =>
			await axios.get(url, {
				headers: scrapeRequestHeader(),
			})
	);
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

export const scrapeVenue = async (venueUrl) => {
	const url = venueUrl;

	// ? Get HTML of the website
	const response = await Queue.enqueue(
		async () =>
			await axios.get(url, {
				headers: scrapeRequestHeader(),
			})
	);
	const html = response.data;

	// ? Load HTML to cheerio
	const $ = cheerio.load(html);

	// ? check if item exists
	const exists = $("div.venue-info").length > 0;
	if (!exists) {
		return { error: true, message: "Venue not found." };
	}

	// ? get venue information
	const id = $("button.btn--wishlist").prop("data-venue-id");
	const name = $("button.btn--wishlist").prop("data-venue-name");
	const details = $(
		"div.venue-details__item--address div.venue-details__item-body p"
	)
		.text()
		.trim();
	const categories = $("div.venue-tags a.venue-tag")
		.toArray()
		.map((x) => $(x).text());
	const googleMapUrl = $(
		"div.venue-details__item--address div.venue-details__item-body a.open-google-map"
	).prop("href");
	const coordinates = googleMapUrl.split("query=")[1].split(",");
	const latitude = coordinates[0];
	const longitude = coordinates[1];
	const openingHours = $(
		"div.venue-details__item--opening div.venue-details__item-body p"
	)
		.map((_, element) => {
			const textElement = $(element);
			return textElement
				.text()
				.replace(/\s+/g, " ")
				.replace(/am(?=\d{2})/, "am, ")
				.replace(/pm(?=\d{2})/, "pm, ");
		})
		.get()
		.join("\n")
		.trim();
	const featuredImages = $("div.venue-hero-images img")
		.map((_, element) => {
			const imageElement = $(element);
			return imageElement.prop("data-src");
		})
		.get();

	return {
		id,
		name,
		details,
		categories,
		featuredImages,
		location: {
			latitude,
			longitude,
		},
		venueUrl,
		googleMapUrl,
		openingHours,
	};
};
