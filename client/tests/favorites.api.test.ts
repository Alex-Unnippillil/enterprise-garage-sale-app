import { configureStore } from '@reduxjs/toolkit';
import { API_URL } from '@/env';

(global as any).fetch = () => Promise.resolve({});
(global as any).Request = function (url: string, init: any = {}) {
  return { url, ...init, clone: () => ({ url, ...init }) };
};

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(() => Promise.resolve({ tokens: { idToken: 'token' } })),
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cleanParams: (p: any) => p,
  createNewUserInDatabase: jest.fn(),
  withToast: jest.fn((p: Promise<any>) => p),
}));

const { api } = require('@/state/api');
const { withToast } = require('@/lib/utils');

const setupStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (gDM) => gDM().concat(api.middleware),
  });

describe('favorite endpoints', () => {
  beforeEach(() => {
    (withToast as jest.Mock).mockClear();
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve('[]'),
      headers: { get: () => 'application/json' },
      clone() {
        return this;
      },
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse)) as any;
  });

  it('getFavorites fetches from correct endpoint', async () => {
    const store = setupStore();
    await store.dispatch(api.endpoints.getFavorites.initiate()).unwrap();
    const request = (fetch as jest.Mock).mock.calls[0][0];
    expect(request.url).toBe(`${API_URL}/favorites`);
    expect(withToast).toHaveBeenCalled();
  });

  it('addFavorite posts to correct endpoint', async () => {
    const store = setupStore();
    await store.dispatch(api.endpoints.addFavorite.initiate({ propertyId: 1 })).unwrap();
    const request = (fetch as jest.Mock).mock.calls[0][0];
    expect(request.url).toBe(`${API_URL}/favorites`);
    expect(request.method).toBe('POST');
    expect(request.body).toBe(JSON.stringify({ propertyId: 1 }));
    expect(withToast).toHaveBeenCalled();
  });

  it('removeFavorite deletes correct endpoint', async () => {
    const store = setupStore();
    await store.dispatch(api.endpoints.removeFavorite.initiate(5)).unwrap();
    const request = (fetch as jest.Mock).mock.calls[0][0];
    expect(request.url).toBe(`${API_URL}/favorites/5`);
    expect(request.method).toBe('DELETE');
    expect(withToast).toHaveBeenCalled();
  });
});
