import logger from "./utils/logger.js";
import db from "./utils/database.js";
import JsonFileStream from "./utils/jsonFileStream.js";

import * as constants from "./constants.js";
const { venuesFilePath } = constants;

const generateUsersJson = async () => {
	const allUsers = await db.getAllUsers();

	for (const user of allUsers) {
		const { id, username_burpple } = user;
		try {
			const venues_fileStream = new JsonFileStream(
				venuesFilePath(username_burpple),
				"dictionary"
			);
			await venues_fileStream.init();

			const arrayOf_venues = await db.getUserWishlist(id);

			const arrayOf_stringsToAppend = arrayOf_venues.map((venue) => {
				const { id_burpple, json_data } = venue;
				return `"${id_burpple}": ${json_data}`;
			});

			await venues_fileStream.append(arrayOf_stringsToAppend, true);

			const lastUpdatedBy = await db.getUserWishListVenuesLastUpdated(id);
			const lastUpdatedBy_date = new Date(`${lastUpdatedBy} UTC`);
			await venues_fileStream.end(lastUpdatedBy_date);

			const outputMsg = `Generated JSON for "${username_burpple}" with ${arrayOf_venues.length} venues on ${lastUpdatedBy_date}.`;
			console.log(outputMsg);
			logger.info(outputMsg);
		} catch (e) {
			logger.error(
				`During JSON generation for "${username_burpple}", encountered an exception.`
			);
			logger.error(e);
		}
	}
};

export default generateUsersJson;
