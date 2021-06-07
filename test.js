import logger from "./logger.js";
import { scrapeVenue } from "./utils/scraperBurpple.js";
import JsonFileStream from "./utils/jsonFileStream.js";
import * as constants from "./constants.js";

const { WISHLIST_DATAFILE, VENUES_DATAFILE } = constants;
const wishlist_fileStream = new JsonFileStream(WISHLIST_DATAFILE);
const venue_fileStream = new JsonFileStream(VENUES_DATAFILE, "dictionary");

let count = 0;
// TODO: the following should be moved to JsonFileStream
const burppleWishlistVenueTask = async () => {
	try {
		venue_fileStream.init();

		const readline = wishlist_fileStream.readline;

		let linesToProcess = 0;
		readline.on("line", async (line) => {
			const isValidData = line.match(/{.*}/) !== null;
			if (!!!isValidData) return false;

			const data = JSON.parse(line.replace(",{", "{")); // remove the first comma in the line, if any
			const { url } = data;
			linesToProcess++;
			const venueData = await scrapeVenue(url);
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
			"During page scraping, encountered an exception. Routine will now terminate."
		);
	}
};

burppleWishlistVenueTask();
