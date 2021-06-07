import logger from "./logger.js";
import { scrapeVenue } from "./utils/scraperBurpple.js";
import JsonFileStream from "./utils/jsonFileStream.js";
import * as constants from "./constants.js";

const { WISHLIST_DATAFILE, VENUES_DATAFILE } = constants;
const wishlist_fileStream = new JsonFileStream(WISHLIST_DATAFILE);
const venue_fileStream = new JsonFileStream(VENUES_DATAFILE, "dictionary");

const burppleWishlistVenueTask = async () => {
	logger.info("Started Burpple wishlist venue scraping..");
	try {
		venue_fileStream.init();

		const readline = wishlist_fileStream.readline;

		let linesToProcess = 0;
		readline.on("line", async (line) => {
			const isValidData = line.match(/{.*}/) !== null;
			if (!!!isValidData) return false;

			const data = JSON.parse(line.replace(",{", "{")); // remove the first comma in the line, if any
			const { url, name } = data;
			linesToProcess++;

			const venueData = await scrapeVenue(url);
			logger.info(`Scraping venue ${name}..`);

			linesToProcess--;
			venueData["inWishlist"] = true;
			console.log(venueData);

			// venue_fileStream.append([{ id: venueData.id, data: venueData }]);
			venue_fileStream.append([venueData]);
			if (linesToProcess === 0) venue_fileStream.end();
		});
	} catch (e) {
		logger.error(e);
		logger.error(
			"During venue wishlist scraping, encountered an exception. Routine will now terminate."
		);
	}
};

export default burppleWishlistVenueTask;
