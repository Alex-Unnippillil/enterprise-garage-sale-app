import axios from "axios";

interface GeocodeParams {
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

const cache = new Map<string, [number, number]>();
let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000;

export const geocodeAddress = async ({
  address,
  city,
  country,
  postalCode,
}: GeocodeParams): Promise<[number, number]> => {
  const cacheKey = `${address}|${city}|${country}|${postalCode}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const now = Date.now();
  const waitTime = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    street: address,
    city,
    country,
    postalcode: postalCode,
    format: "json",
    limit: "1",
  }).toString()}`;

  const response = await axios.get(geocodingUrl, {
    headers: {
      "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com",
    },
  });

  const [longitude, latitude] =
    response.data[0]?.lon && response.data[0]?.lat
      ? [
          parseFloat(response.data[0]?.lon),
          parseFloat(response.data[0]?.lat),
        ]
      : [0, 0];

  cache.set(cacheKey, [longitude, latitude]);
  return [longitude, latitude];
};
