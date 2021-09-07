import burppleWishlistTask from "./burppleWishlistTask.js";
import burppleWishlistVenueTask from "./burppleWishlistVenueTask.js";
import firestore from "./firebase.js";

// TODO: update this to a method that won't result in large memory usage
const usernamesArray = await firestore.getUsernames();
// const usernamesArray = ["RunningMan", "Nicoleiscool"];

// future direction:
// 1) store all usernames, 1 at a time, into sqllite
// 2) WISHLIST - build a recursive function that will process through all usernames via sqllite
// 3) for each wishlist items, add to sqlite venue
// 4) VENUE - scrape venue data
// 5) generate venue json files for each user via sqlite

// for now, we will stick to this slow & hacky way...

// ? scrape the wishlist first
burppleWishlistTask(usernamesArray, () => {
	console.log(usernamesArray);
	// ? then scrape each venue inside the wishlist
	burppleWishlistVenueTask(usernamesArray);
});
