import logger from "./logger.js";
import { scrapeVenue } from "./utils/scraperBurpple.js";
import JsonFileStream from "./utils/jsonFileStream.js";
import * as constants from "./constants.js";

const { wishlistFilePath, venuesFilePath } = constants;

const burppleWishlistVenueTask = async (original_usernamesArray) => {
	const usernamesArray = [...original_usernamesArray];

	usernamesArray.forEach((username) => {
		const wishlist_fileStream = new JsonFileStream(wishlistFilePath(username));
		const venues_fileStream = new JsonFileStream(
			venuesFilePath(username),
			"dictionary"
		);

		logger.info(`Started Burpple wishlist venue scraping for @${username}...`);
		try {
			if (!wishlist_fileStream.exists) throw "Wishlist file does not exist.";
			venues_fileStream.init();

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

				// venues_fileStream.append([{ id: venueData.id, data: venueData }]);
				await venues_fileStream.append([venueData]);

				if (linesToProcess === 0) venues_fileStream.end();
			});
		} catch (e) {
			logger.error(e);
			logger.error(
				"During venue scraping, encountered an exception. Routine will now terminate."
			);
		}
	});
};

export default burppleWishlistVenueTask;
