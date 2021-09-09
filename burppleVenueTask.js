import logger from "./utils/logger.js";
import { scrapeVenue } from "./utils/scraperBurpple.js";
import db from "./utils/database.js";

const burppleVenueTask = () => {
  const _scrapeVenues = async (arrayOf_venues) => {
    for (const venue of arrayOf_venues) {
      try {
        const { id, url } = venue;

        const venueData = await scrapeVenue(url);
        logger.info(`Scraped ${url}...`);

        console.log(venueData);
        await db.updateVenueData(id, venueData);
      } catch (e) {
        logger.error(`During scraping, encountered an exception.`);
        logger.error(e);
      }
    }
  };

  const scrapeNullVenues = async () => {
    const nullVenues = await db.getNullVenues();
    await _scrapeVenues(nullVenues);
  };

  const scrapeOldVenues = async () => {
    const oldVenues = await db.getOldVenues();
    await _scrapeVenues(oldVenues);
  };

  return {
    scrapeNullVenues,
    scrapeOldVenues,
  };
};

export default burppleVenueTask();
