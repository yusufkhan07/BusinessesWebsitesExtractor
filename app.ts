import {
  Client,
  PlacesNearbyResponse
} from "@googlemaps/google-maps-services-js";

import { Sequelize } from "sequelize-typescript";
import { default as WebsiteModel } from "./models/website.model";

// config
const API_KEY = "AIzaSyCD_J38SJh8ho0mhSyA5GoQjZ1LVe3Ks5U";

const sequelize = new Sequelize({
  // config
  models: [__dirname + "/models"],
  // for mysql
  //// put mysql config here!

  // for sqlite
  database: "some_db",
  dialect: "sqlite",
  storage: "db.sqlite"
});

// globals
const client = new Client({});

/**
 * Get a website by place_id
 *
 * @param place_id
 */
const placeDetails = async (place_id: string) => {
  const place = await client.placeDetails({
    params: {
      key: API_KEY,
      fields: ["website"],
      place_id
    }
  });

  return {
    place_id,
    website: place.data.result.website
  };
};

/**
 * Get list of places along with websites
 *
 * @param location
 * @param radius
 */
const getPlacesByLocation = async (location, radius: number) => {
  // for debugging
  // return [
  //   // {
  //   //   place_id: "ChIJO30UDHKV3zgR6S7lsn61fK0",
  //   //   website: "https://www.shifa.com.pk/"
  //   // },
  //   {
  //     place_id: "ChIJu74YtEOuEmsRZVq9lNEs8vc",
  //     website: undefined
  //   },
  //   {
  //     place_id: "ChIJ0zxfbzyuEmsRYYkBoKdBTP4",
  //     website: "https:/www/sydney.frasershospitality.com/"
  //   }
  //   // {
  //   //   place_id: "ChIJZ934S0KuEmsR_0lxV3PTR4M",
  //   //   website: "https://www.fourseasons.com/sydney/?seo=google_local_syd1_apac"
  //   // },
  //   // {
  //   //   place_id: "ChIJKR-RkzuuEmsR0IrnPnwUQRk",
  //   //   website:
  //   //     "https://www.panpacific.com/en/hotels-and-resorts/pr-darling-harbour-sydney/offers.html?utm_source=google&utm_medium=business_listing&utm_campaign=googlemybusiness"
  //   // },
  //   // {
  //   //   place_id: "ChIJ4fN7mzyuEmsRKZ3ylJxaUHg",
  //   //   website:
  //   //     "https://www.radissonhotels.com/en-us/hotels/radisson-sydney?cid=a:se+b:gmb+c:apac+i:local+e:rad+d:row+h:AUSYDNEY"
  //   // }
  // ];

  // next page token
  let pagetoken: undefined | string = undefined;

  // list of place websites
  const place_website_list: Array<{
    place_id: string;
    website: string | undefined;
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
    }>[];

    places.forEach(place => {
      if (place.place_id) {
        promises.push(placeDetails(place.place_id));
      }
    });

    place_website_list.push(...(await Promise.all(promises)));

    // promises.push(placeDetails("ChIJO30UDHKV3zgR6S7lsn61fK0"));
    // await new Promise(r => setTimeout(r, 2000));

    pagetoken = response.data.next_page_token;
  } while (pagetoken);

  return place_website_list;
};

const main = async () => {
  // sync and init the db
  await sequelize.sync({
    // force: true
  });

  // get the websites list
  const place_website_list = await getPlacesByLocation(
    "-33.8670522,151.1957362",
    1500
  );

  // filter places which have a website
  const filtered_data = place_website_list.filter(place_website => {
    return typeof place_website.website === "string";
  }) as Array<{
    place_id: string;
    website: string;
  }>;

  console.log(`found ${filtered_data.length} places with a website address.`);

  // add to db
  WebsiteModel.bulkCreate(filtered_data, {
    fields: ["place_id", "website"],
    ignoreDuplicates: true
    // updateOnDuplicate: ["place_id"]
  });
};

// run main
main();

// //keep script alive
// setInterval(() => {}, 1000);
