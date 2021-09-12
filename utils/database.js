import _knex from "knex";
import appRoot from "app-root-path";

const createDb = async () => {
  const config = {
    client: "sqlite3",
    connection: {
      filename: `${appRoot}/data/data.db`,
    },
    useNullAsDefault: true,
  };

  const knex = _knex(config);

  try {
    const usersExist = await knex.schema.hasTable("users");
    if (!usersExist) {
      await knex.schema.createTable("users", (table) => {
        table.increments("id");
        table.string("username_burpple");
      });
    }

    const venuesExists = await knex.schema.hasTable("venues");
    if (!venuesExists) {
      await knex.schema.createTable("venues", (table) => {
        table.increments("id");
        table.integer("id_burpple");
        table.string("name");
        table.string("url");
        table.json("json_data");
        table.timestamps(true, true);
      });
    }

    const wishlistsExists = await knex.schema.hasTable("wishlists");
    if (!wishlistsExists) {
      await knex.schema.createTable("wishlists", (table) => {
        table.increments("id");
        table.integer("user_id").unsigned().references("users.id");
        table.integer("venue_id").unsigned().references("venues.id");
      });
    }
  } catch (e) {
    console.error(e);
  }

  const insertUpdate = async (tableName, colName, val, payload) => {
		if (payload === undefined) {
			payload = {};
			payload[colName] = val;
		}

    try {
      const arrayOf_rows = await knex(tableName).select('id').where(colName, val);
      const empty = arrayOf_rows.length === 0;

      if (empty) {
        const arrayOf_inserted_ids = await knex(tableName).insert(payload);
        return arrayOf_inserted_ids[0];
      } else {
        await knex(tableName)
          .where(colName, "=", val)
          .update(payload);

        return arrayOf_rows[0].id;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveUser = async (username) => {
    try {
      const result =  await insertUpdate("users", "username_burpple", username);
			console.log(`Saved user "${username}".`)
			return result;
    } catch (e) {
      console.error(e);
    }
  };

  const clearWishlist = async (username) => {
    try {
      const user_id = await saveUser(username);
      const result = await knex("wishlists").where("user_id", user_id).del();
			console.log(`Cleared all wishlists for "${username}".`)
			return result;
    } catch (e) {
      console.error(e);
    }
  };

  const saveVenue = async (id_burpple, venueData) => {
    try {
			const result = await insertUpdate(
				"venues",
				"id_burpple",
				id_burpple,
				venueData
			);

			const { name = "" } = venueData;
			console.log(`Saved venue ${id_burpple} ${name} (ID: ${result}).`)
			return result;
    } catch (e) {
      console.error(e);
    }
  };

  const saveWishlists = async (username_burpple, arrayOf_venues) => {
    try {
      const user_id = await saveUser(username_burpple);

      const arrayOf_wishlists = [];

      for (const venue of arrayOf_venues) {
        const { id_burpple, name, url } = venue;

        const venue_id = await saveVenue(
          id_burpple,
          { id_burpple, name, url }
        );

        arrayOf_wishlists.push({
          user_id,
          venue_id,
        });
      }

      const wishlist_insert_ids = await knex("wishlists").insert(
        arrayOf_wishlists
      );
			console.log(`Saved ${arrayOf_wishlists.length} wishlists for user "${username_burpple}".`)
      return wishlist_insert_ids;
    } catch (e) {
      console.error(e);
    }
  };

  const getNullVenues = async () => {
    return await knex("venues").select("id", "url").whereNull("json_data");
  };

	const getOldVenues = async (daysThreshold = 1) => {
		const targetDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
		return await knex("venues").select("id", "url").whereNull("updated_at", "<", targetDate);
	}

  const updateVenueData = async (id, data) => {
		try {
			const result = await knex("venues")
				.where("id", id)
				.update({
					json_data: JSON.stringify(data),
					updated_at: knex.fn.now(),
				});
				console.log(`Updated venue ${id}'s json_data.`)
				return result;
    } catch (e) {
      console.error(e);
    }
  };

  const getAllUsers = async () => {
    return await knex("users").select("id", "username_burpple");
  };

  const getUserWishlist = async (id) => {
    return await knex
      .select("venues.id_burpple", "venues.json_data")
      .from("wishlists")
      .innerJoin("users", "wishlists.user_id", "users.id")
      .innerJoin("venues", "wishlists.venue_id", "venues.id")
      .where("users.id", id);
  };

  const getUserWishListVenuesLastUpdated = async (id) => {
    const result = await knex
      .select("venues.updated_at")
      .from("wishlists")
      .innerJoin("users", "wishlists.user_id", "users.id")
      .innerJoin("venues", "wishlists.venue_id", "venues.id")
      .where("users.id", id)
      .orderBy("venues.updated_at", "desc")
      .limit(1);

    if (result.length === 0 ) return false;
    else return result[0].updated_at;
  };

  return {
    saveUser,
    saveWishlists,
    clearWishlist,
    getNullVenues,
		getOldVenues,
    updateVenueData,
    getAllUsers,
		getUserWishlist,
    getUserWishListVenuesLastUpdated
  };
};

const db = await createDb();
export default db;
