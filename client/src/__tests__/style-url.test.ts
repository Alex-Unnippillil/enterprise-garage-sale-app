import { styleToSearchParams, styleFromSearchParams, StyleOptions } from "@/lib/style-url";

describe('style url helpers', () => {
  it('serializes and parses style options', () => {
    const style: StyleOptions = {
      text: 'Hello',
      font: 'Standard',
      sc: '#123456',
      ec: '#abcdef',
      k: 2,
    };
    const qs = styleToSearchParams(style);
    const parsed = styleFromSearchParams(new URLSearchParams(qs));
    expect(parsed).toEqual(style);
  });
});
