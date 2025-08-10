import axios from "axios";

export interface GeocodeInput {
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export const geocodeAddress = async ({
  address,
  city,
  country,
  postalCode,
}: GeocodeInput): Promise<Coordinates> => {
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
      "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
    },
  });

  const longitude = geocodingResponse.data[0]?.lon
    ? parseFloat(geocodingResponse.data[0].lon)
    : 0;
  const latitude = geocodingResponse.data[0]?.lat
    ? parseFloat(geocodingResponse.data[0].lat)
    : 0;

  return { longitude, latitude };
};
