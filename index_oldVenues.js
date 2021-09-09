import burppleVenueTask from "./burppleVenueTask.js"
import generateUsersJson from "./generateUsersJson.js"

await burppleVenueTask.scrapeOldVenues();
await generateUsersJson();

process.exit();