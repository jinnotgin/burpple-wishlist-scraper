# burpple-wishlist-scraper
 
This repository contains the scripts necessary to collect all burpple wishlists data, and will serve the resulting json file to https://faveats.net (source: https://github.com/jinnotgin/nearby-favourite-eats-ui)

A worker will be regularly updating the json files, with a new commit made everytime there are changes detected.

## Todo

- [x] Figure out bug with new user additions resulting in a (first time) malformed data output (ending tag is not added)
- [ ] Update username retrieval method to be not from memory
- [ ] Figure out why venue refreshing is occuring at a daily (vs every threshold)
- [ ] Add cleanup mechanism for orphaned venues (no longer wishlisted by anyone)
