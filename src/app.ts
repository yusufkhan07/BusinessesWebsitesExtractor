import {
  Client,
  PlacesNearbyResponse
} from "@googlemaps/google-maps-services-js";

import { Sequelize } from "sequelize-typescript";
import { default as WebsiteModel } from "./models/website.model";
var fs = require("fs");

// globals
const client = new Client({});

// load API key
const API_KEY = JSON.parse(fs.readFileSync(`${__dirname}/key.json`, "utf8"))
  .key;

// load sql config
const sql_credentials = JSON.parse(
  fs.readFileSync(`${__dirname}/sql-config.json`, "utf8")
).production;

// connect to db
const sequelize = new Sequelize({
  models: [__dirname + "/models"],
  ...sql_credentials
});

/**
 * Get a website by place_id
 *
 * @param place_id
 */
const placeDetails = async (place_id: string) => {
  const place = await client.placeDetails({
    params: {
      key: API_KEY,
      // fields: ["website"],
      place_id
    }
  });

  return {
    place_id,
    website: place.data.result.website,
    name: place.data.result.name,
    formatted_phone_number: place.data.result.formatted_phone_number,
    international_phone_number: place.data.result.international_phone_number
  };
};

/**
 * Get list of places along with websites
 *
 * @param location
 * @param radius
 */
const getPlacesByLocation = async (location, radius: number) => {
  // next page token
  let pagetoken: undefined | string = undefined;

  // list of place websites
  const place_website_list: Array<{
    place_id: string;
    website: string | undefined;
    name: string | undefined;
    formatted_phone_number: string | undefined;
    international_phone_number: string | undefined;
  }> = [];

  do {
    // get nearby places using location
    const response: PlacesNearbyResponse = await client.placesNearby({
      params: {
        key: API_KEY,
        location,
        radius,
        pagetoken
      }
    });

    // get place details & store
    const places = response.data.results;

    const promises = [] as Promise<{
      place_id: string;
      website: string | undefined;
      name: string | undefined;
      formatted_phone_number: string | undefined;
      international_phone_number: string | undefined;
    }>[];

    places.forEach(place => {
      if (place.place_id) {
        promises.push(placeDetails(place.place_id));
      }
    });

    // promises.push(placeDetails("ChIJO30UDHKV3zgR6S7lsn61fK0"));
    // await new Promise(r => setTimeout(r, 2000));

    place_website_list.push(...(await Promise.all(promises)));

    pagetoken = response.data.next_page_token;

    // break;
  } while (pagetoken);

  return place_website_list;
};

const main = async (location, radius: number) => {
  // sync and init the db
  await sequelize.sync({});

  // get the websites list
  const place_website_list = await getPlacesByLocation(location, radius);

  // filter places which have a website
  const filtered_data = place_website_list.filter(place_website => {
    return typeof place_website.website === "string";
  }) as Array<{
    place_id: string;
    website: string;
    name: string | undefined;
    formatted_phone_number: string | undefined;
    international_phone_number: string | undefined;
  }>;

  console.log(`found ${filtered_data.length} places with a website address.`);

  // add to db
  WebsiteModel.bulkCreate(filtered_data, {
    fields: [
      "place_id",
      "website",
      "name",
      "formatted_phone_number",
      "international_phone_number"
    ],
    ignoreDuplicates: true
  });

  console.log(`execution completed`);
};

// run main
main("-33.8670522,151.1957362", 1500);

// keep the script alive for debugging
setInterval(() => {}, 1000);
