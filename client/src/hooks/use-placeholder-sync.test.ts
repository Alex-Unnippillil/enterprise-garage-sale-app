import { renderHook, act } from '@testing-library/react';
import { usePlaceholderSync } from './use-placeholder-sync';

describe('usePlaceholderSync', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ id: 1, title: 'test' }),
    });
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });
  });

  it('falls back to manual sync and fetches data', async () => {
    const { result } = renderHook(() => usePlaceholderSync());
    expect(result.current.isSupported).toBe(false);

    await act(async () => {
      await result.current.manualSync();
    });

    expect(result.current.data).toEqual({ id: 1, title: 'test' });
  });
});
