import axios from 'axios';
import { GEOCODE_USER_AGENT } from '../env';
import { getCachedGeocode, saveGeocode } from '../services/geocode-cache';

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
    format: 'json',
    limit: '1',
  }).toString()}`;

  if (!GEOCODE_USER_AGENT) {
    throw new Error('GEOCODE_USER_AGENT environment variable is required for geocoding requests');
  }

  let geocodingResponse;

  try {
    geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        'User-Agent': GEOCODE_USER_AGENT,
      },
      timeout: 5000,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Geocoding request timed out');
    }
    throw error;
  }

  if (!geocodingResponse.data?.[0]) {
    throw new Error('Geocoding failed');
  }

  const longitude = parseFloat(geocodingResponse.data[0].lon);
  const latitude = parseFloat(geocodingResponse.data[0].lat);

  await saveGeocode(address, city, postalCode, longitude, latitude);

  return [longitude, latitude];
};

export default geocodeAddress;
