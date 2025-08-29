import { humanizeBytes, humanizeDuration } from '@/apps/converter/units';

describe('unit converters', () => {
  it('converts bytes to human readable strings', () => {
    expect(humanizeBytes(0)).toBe('0 B');
    expect(humanizeBytes(1024)).toBe('1 KB');
    expect(humanizeBytes(1048576)).toBe('1 MB');
  });

  it('converts milliseconds to human readable duration', () => {
    expect(humanizeDuration(1000)).toBe('1s');
    expect(humanizeDuration(61000)).toBe('1m 1s');
    expect(humanizeDuration(3661000)).toBe('1h 1m 1s');
  });
});
