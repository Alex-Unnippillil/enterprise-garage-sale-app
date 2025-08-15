describe('geocodeAddress', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('throws error when GEOCODE_USER_AGENT is undefined', async () => {
    jest.doMock('axios', () => ({ get: jest.fn().mockResolvedValue({ data: [{ lon: '1', lat: '2' }] }) }));
    jest.doMock('../../env', () => ({ GEOCODE_USER_AGENT: undefined }));
    jest.doMock('../../services/geocode-cache', () => ({
      getCachedGeocode: jest.fn().mockResolvedValue(null),
      saveGeocode: jest.fn(),
    }));

    const { geocodeAddress } = require('../geocode-address');

    await expect(
      geocodeAddress('123 Main St', 'Springfield', 'USA', '12345'),
    ).rejects.toThrow('GEOCODE_USER_AGENT environment variable is required');
  });

  it('caching prevents duplicate HTTP requests', async () => {
    const axiosGet = jest.fn().mockResolvedValue({ data: [{ lon: '1', lat: '2' }] });
    jest.doMock('axios', () => ({ get: axiosGet }));

    const getCachedGeocode = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([1, 2]);
    const saveGeocode = jest.fn();

    jest.doMock('../../env', () => ({ GEOCODE_USER_AGENT: 'agent' }));
    jest.doMock('../../services/geocode-cache', () => ({
      getCachedGeocode,
      saveGeocode,
    }));

    const { geocodeAddress } = require('../geocode-address');

    await geocodeAddress('123 Main St', 'Springfield', 'USA', '12345');
    await geocodeAddress('123 Main St', 'Springfield', 'USA', '12345');

    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(getCachedGeocode).toHaveBeenCalledTimes(2);
  });
});

