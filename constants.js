import appRoot from "app-root-path";

const USER = "jinnotgin";
const DATA_FOLDER = `${appRoot}/data/`;

export const SCRAPE_HOST = "https://www.burpple.com";
export const wishlistUrl = (USER) => `${SCRAPE_HOST}/@${USER}/wishlist`;

export const dataFilePath = (USER, FILE) =>
	`${appRoot}/data/${USER}/${FILE}.json`;
export const wishlistFilePath = (USER) => dataFilePath(USER, "wishlist");
export const venuesFilePath = (USER) => dataFilePath(USER, "venues");
