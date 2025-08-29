import { parseEntries } from "../lib/parseEntries";

describe('parseEntries', () => {
  it('parses text lines into entries', () => {
    const text = 'example.com /index.html high\nexample.org /about low';
    const entries = parseEntries(text);
    expect(entries).toEqual([
      { host: 'example.com', path: '/index.html', severity: 'high' },
      { host: 'example.org', path: '/about', severity: 'low' }
    ]);
  });

  it('parses xml into entries', () => {
    const xml = `<?xml version="1.0"?><root><entry><host>a.com</host><path>/</path><severity>medium</severity></entry></root>`;
    const entries = parseEntries(xml);
    expect(entries).toEqual([
      { host: 'a.com', path: '/', severity: 'medium' }
    ]);
  });
});
