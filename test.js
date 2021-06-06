import { scrapeVenue } from "./utils/scraperBurpple.js";
import JsonFileStream from "./utils/jsonFileStream.js";
import * as constants from "./constants.js";
import os from "os";
const { WISHLIST_DATAFILE, VENUES_DATAFILE } = constants;
const wishlist_fileStream = new JsonFileStream(WISHLIST_DATAFILE);
const venue_fileStream = new JsonFileStream(VENUES_DATAFILE, "object");

venue_fileStream.init();

// TODO: the following should be moved to JsonFileStream
const readline = wishlist_fileStream.readline;
readline.on("line", async (line) => {
	const isValidData = line.match(/{.*},/) !== null;
	if (!!!isValidData) return false;

	const data = JSON.parse(line.replace("},", "}"));
	console.log(data);

	const { url } = data;
	const venueData = await scrapeVenue(url);
	console.log(venueData);

	venue_fileStream.append([{ id: venueData.id, data: venueData }]);

	// TODO get last line detection
	if (line == "" || line == os.EOL) {
		console.log("eof, last line is", lastLine);

		venue_fileStream.end();
		return;
	}
});
