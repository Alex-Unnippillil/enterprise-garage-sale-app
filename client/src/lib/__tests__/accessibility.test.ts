import { prefersReducedMotion } from '../accessibility';

describe('motion preference', () => {
  it('returns true when system prefers reduced motion', () => {
    (window as any).matchMedia = () => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    expect(prefersReducedMotion()).toBe(true);
  });
});
