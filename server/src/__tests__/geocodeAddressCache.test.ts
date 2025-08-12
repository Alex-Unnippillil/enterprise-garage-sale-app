import axios from 'axios';
import { clearCache } from '../utils/geocodeCache';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

let geocodeAddress: (
  address: string,
  city: string,
  country: string,
  postalCode: string,
) => Promise<[number, number]>;

describe('geocodeAddress caching', () => {
  beforeEach(() => {
    clearCache();
    mockedAxios.get.mockReset();
    Object.assign(process.env, {
      GEOCODE_USER_AGENT: 'test-agent',
      DATABASE_URL: 'https://example.com',
      COGNITO_AUDIENCE: 'aud',
      COGNITO_ISSUER: 'issuer',
      AWS_REGION: 'us-east-1',
      S3_BUCKET_NAME: 'bucket',
      AWS_ACCESS_KEY_ID: 'key',
      AWS_SECRET_ACCESS_KEY: 'secret',
      JWT_SECRET: 'jwt',
    });
    geocodeAddress = require('../utils/geocodeAddress').geocodeAddress;
  });

  it('reuses cached coordinates on repeated calls', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [{ lon: '1', lat: '2' }],
    });

    const params: [string, string, string, string] = ['123 Main', 'Town', 'USA', '12345'];

    const first = await geocodeAddress(...params);
    expect(first).toEqual([1, 2]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    const second = await geocodeAddress(...params);
    expect(second).toEqual([1, 2]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
