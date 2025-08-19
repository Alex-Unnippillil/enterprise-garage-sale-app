import { configureStore } from '@reduxjs/toolkit';
import type { Payment } from '@/types/prisma-types';
import { withToast } from '@/lib/utils';

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn().mockResolvedValue({ tokens: { idToken: 'test-token' } }),
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  withToast: jest.fn((p: Promise<any>) => p),
  cleanParams: jest.fn((p) => p),
  createNewUserInDatabase: jest.fn(),
}));

class MockRequest {
  url: string;
  method?: string;
  headers: any;
  body?: any;
  constructor(input: any, init?: any) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init?.method;
    this.headers = init?.headers ?? {};
    this.body = init?.body;
  }
}

(global as any).Request = MockRequest;
const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

const { api } = require('@/state/api');

const setupStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (gDM) => gDM().concat(api.middleware),
  });

describe('payment mutations', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    (withToast as jest.Mock).mockClear();
  });

  it('creates a payment via POST', async () => {
    const store = setupStore();
    const mockPayment: Payment = {
      id: 1,
      amountDue: 1000,
      amountPaid: 1000,
      dueDate: '2024-01-01T00:00:00.000Z',
      paymentDate: '2024-01-02T00:00:00.000Z',
      paymentStatus: 'PAID',
      leaseId: 1,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPayment,
      text: async () => JSON.stringify(mockPayment),
      clone() {
        return this;
      },
      headers: { get: () => 'application/json' },
    });

    const body = {
      amountDue: mockPayment.amountDue,
      amountPaid: mockPayment.amountPaid,
      dueDate: mockPayment.dueDate,
      paymentDate: mockPayment.paymentDate,
      paymentStatus: mockPayment.paymentStatus,
    };

    const result = await store
      .dispatch(api.endpoints.createPayment.initiate({ leaseId: 1, ...body }))
      .unwrap();

    const req = fetchMock.mock.calls[0][0] as any;
    expect(req.url).toBe('http://localhost:3001/leases/1/payments');
    expect(req.method).toBe('POST');
    expect(req.body).toBe(JSON.stringify(body));
    expect(result).toEqual(mockPayment);
    expect(withToast).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        success: 'Payment created successfully!',
        error: 'Failed to create payment.',
      })
    );
  });

  it('updates a payment via PUT', async () => {
    const store = setupStore();
    const mockPayment: Payment = {
      id: 2,
      amountDue: 1500,
      amountPaid: 500,
      dueDate: '2024-02-01T00:00:00.000Z',
      paymentDate: '2024-02-03T00:00:00.000Z',
      paymentStatus: 'PENDING',
      leaseId: 2,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPayment,
      text: async () => JSON.stringify(mockPayment),
      clone() {
        return this;
      },
      headers: { get: () => 'application/json' },
    });

    const body = {
      amountPaid: mockPayment.amountPaid,
      paymentStatus: mockPayment.paymentStatus,
    };

    const result = await store
      .dispatch(api.endpoints.updatePayment.initiate({ paymentId: 2, ...body }))
      .unwrap();

    const req = fetchMock.mock.calls[0][0] as any;
    expect(req.url).toBe('http://localhost:3001/leases/payments/2');
    expect(req.method).toBe('PUT');
    expect(req.body).toBe(JSON.stringify(body));
    expect(result).toEqual(mockPayment);
    expect(withToast).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        success: 'Payment updated successfully!',
        error: 'Failed to update payment.',
      })
    );
  });

  it('fetches payment history via GET', async () => {
    const store = setupStore();
    const mockPayments: Payment[] = [
      {
        id: 1,
        amountDue: 100,
        amountPaid: 100,
        dueDate: '2024-01-01T00:00:00.000Z',
        paymentDate: '2024-01-02T00:00:00.000Z',
        paymentStatus: 'PAID',
        leaseId: 1,
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPayments,
      text: async () => JSON.stringify(mockPayments),
      clone() {
        return this;
      },
      headers: { get: () => 'application/json' },
    });

    const result = await store
      .dispatch(api.endpoints.getPaymentHistory.initiate())
      .unwrap();

    const req = fetchMock.mock.calls[0][0] as any;
    expect(req.url).toBe('http://localhost:3001/payments/history');
    expect(req.method).toBeUndefined();
    expect(result).toEqual(mockPayments);
    expect(withToast).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        error: 'Failed to fetch payment history.',
      })
    );
  });

  it('creates a charge via POST', async () => {
    const store = setupStore();
    const mockResponse = { clientSecret: 'secret' };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
      clone() {
        return this;
      },
      headers: { get: () => 'application/json' },
    });

    const body = { amount: 500, leaseId: 1 };
    const result = await store
      .dispatch(api.endpoints.chargePayment.initiate(body))
      .unwrap();

    const req = fetchMock.mock.calls[0][0] as any;
    expect(req.url).toBe('http://localhost:3001/payments/charge');
    expect(req.method).toBe('POST');
    expect(req.body).toBe(JSON.stringify(body));
    expect(result).toEqual(mockResponse);
    expect(withToast).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        error: 'Failed to create charge.',
      })
    );
  });
});
