import burppleWishlistTask from "./burppleWishlistTask.js";
import burppleWishlistVenueTask from "./burppleWishlistVenueTask.js";

// ? scrape the wishlist first
burppleWishlistTask(() => {
	// ? then scrape each venue inside the wishlist
	burppleWishlistVenueTask();
});
