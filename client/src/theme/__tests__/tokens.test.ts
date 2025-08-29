import { highContrastTokens } from '../tokens';

function luminance(hex: string) {
  const rgb = [0, 1, 2].map((i) => {
    const c = parseInt(hex.substr(1 + i * 2, 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(hex1: string, hex2: string) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test('high contrast tokens meet WCAG AAA contrast', () => {
  const ratio = contrast(highContrastTokens.background, highContrastTokens.foreground);
  expect(ratio).toBeGreaterThanOrEqual(7);
});
