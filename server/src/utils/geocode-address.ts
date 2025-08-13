import axios from "axios";
import { GEOCODE_USER_AGENT } from "../env";
import {
  getCachedGeocode,
  saveGeocodeToCache,
} from "../services/geocode-cache";

export const geocodeAddress = async (
  address: string,
  city: string,
  country: string,
  postalCode: string,
): Promise<[number, number]> => {
  const cached = await getCachedGeocode(address, city, postalCode);
  if (cached) {
    return cached;
  }

  const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    street: address,
    city,
    country,
    postalcode: postalCode,
    format: "json",
    limit: "1",
  }).toString()}`;

  if (!GEOCODE_USER_AGENT) {
    throw new Error(
      "GEOCODE_USER_AGENT environment variable is required for geocoding requests",
    );
  }

  const geocodingResponse = await axios.get(geocodingUrl, {
    headers: {
      "User-Agent": GEOCODE_USER_AGENT,
    },
  });

  if (!geocodingResponse.data?.[0]) {
    throw new Error("Geocoding failed");
  }

  const coordinates: [number, number] = [
    parseFloat(geocodingResponse.data[0].lon),
    parseFloat(geocodingResponse.data[0].lat),
  ];

  await saveGeocodeToCache(
    address,
    city,
    postalCode,
    coordinates[0],
    coordinates[1],
  );

  return coordinates;
};

export default geocodeAddress;
