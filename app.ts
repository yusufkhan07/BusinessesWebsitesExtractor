import {
  Client,
  PlacesNearbyResponse
} from "@googlemaps/google-maps-services-js";

// config
const API_KEY = "AIzaSyCD_J38SJh8ho0mhSyA5GoQjZ1LVe3Ks5U";

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

const getPlacesByLocation = async (location, radius: number) => {
  return [
    {
      place_id: "ChIJO30UDHKV3zgR6S7lsn61fK0",
      website: "http://www.shifa.com.pk/"
    },
    {
      place_id: "ChIJO30UDHKV3zgR6S7lsn61fK0",
      website: "http://www.shifa.com.pk/"
    },
    {
      place_id: "ChIJO30UDHKV3zgR6S7lsn61fK0",
      website: "http://www.shifa.com.pk/"
    }
  ];

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

    // places.forEach(place => {
    //   if (place.place_id) {
    //     promises.push(placeDetails(place.place_id));
    //   }
    // });

    promises.push(placeDetails("ChIJO30UDHKV3zgR6S7lsn61fK0"));

    place_website_list.push(...(await Promise.all(promises)));

    // await new Promise(r => setTimeout(r, 2000));

    pagetoken = response.data.next_page_token;
  } while (pagetoken);

  return place_website_list;
};

const main = async () => {
  const place_website_list = await getPlacesByLocation(
    "-33.8670522,151.1957362",
    1500
  );

  // add the list to db.
};

main();
