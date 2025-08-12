import axios from "axios";
import env from "../utils/env";

export const geocodeAddress = async (
  address: string,
  city: string,
  country: string,
  postalCode: string,
): Promise<[number, number]> => {
  const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    street: address,
    city,
    country,
    postalcode: postalCode,
    format: "json",
    limit: "1",
  }).toString()}`;

  const geocodingResponse = await axios.get(geocodingUrl, {
    headers: {
      "User-Agent": env.GEOCODE_USER_AGENT,
    },
  });

  if (!geocodingResponse.data?.[0]) {
    throw new Error("Geocoding failed");
  }

  return [
    parseFloat(geocodingResponse.data[0].lon),
    parseFloat(geocodingResponse.data[0].lat),
  ];
};

export default geocodeAddress;
