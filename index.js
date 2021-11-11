import burppleWishlistTask from "./burppleWishlistTask.js";
// import burppleWishlistVenueTask from "./burppleWishlistVenueTask.js";
import burppleVenueTask from "./burppleVenueTask.js";
import generateUsersJson from "./generateUsersJson.js";
import firestore from "./utils/firebase.js";

// TODO: update this to a method that won't result in large memory usage
const usernamesArray = await firestore.getUsernames();
//const usernamesArray = ["RunningMan", "sarahs"];

burppleWishlistTask(usernamesArray, async () => {
	// burppleWishlistVenueTask(usernamesArray);

	await burppleVenueTask.scrapeNullVenues();
	await generateUsersJson();

	process.exit();
});
