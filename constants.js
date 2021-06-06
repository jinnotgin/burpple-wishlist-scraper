import appRoot from "app-root-path";

const USER = "jinnotgin";

export const SCRAPE_HOST = "https://www.burpple.com";
export const WISHLIST_URL = `${SCRAPE_HOST}/@${USER}/wishlist`;

export const WISHLIST_DATAFILE = `${appRoot}/data/wishlist.json`;
export const VENUES_DATAFILE = `${appRoot}/data/venues.json`;
