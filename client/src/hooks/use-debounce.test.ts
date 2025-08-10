import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  jest.useFakeTimers();

  it('delays value change by the specified time', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    expect(result.current).toBe('a');

    rerender({ value: 'b', delay: 500 });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('b');
  });
});
