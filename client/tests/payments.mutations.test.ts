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

describe('payments mutations', () => {
  beforeEach(() => {
    (withToast as jest.Mock).mockClear();
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}'),
      headers: { get: () => 'application/json' },
      clone() {
        return this;
      },
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse)) as any;
  });

  it('createPayment posts to correct endpoint', async () => {
    const store = setupStore();
    await store
      .dispatch(
        api.endpoints.createPayment.initiate({
          leaseId: 1,
          amountDue: 500,
          amountPaid: 400,
        }),
      )
      .unwrap();
    const request = (fetch as jest.Mock).mock.calls[0][0];
    expect(request.url).toBe(`${API_URL}/leases/1/payments`);
    expect(request.method).toBe('POST');
    expect(request.body).toBe(JSON.stringify({ amountDue: 500, amountPaid: 400 }));
    expect(withToast).toHaveBeenCalled();
  });

  it('updatePayment puts to correct endpoint', async () => {
    const store = setupStore();
    await store
      .dispatch(
        api.endpoints.updatePayment.initiate({
          paymentId: 2,
          amountPaid: 300,
        }),
      )
      .unwrap();
    const request = (fetch as jest.Mock).mock.calls[0][0];
    expect(request.url).toBe(`${API_URL}/leases/payments/2`);
    expect(request.method).toBe('PUT');
    expect(request.body).toBe(JSON.stringify({ amountPaid: 300 }));
    expect(withToast).toHaveBeenCalled();
  });
});
