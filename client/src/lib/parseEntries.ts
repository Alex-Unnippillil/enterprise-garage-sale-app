export interface Entry {
  host: string;
  path: string;
  severity: string;
}

function parseText(text: string): Entry[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [host, path, severity] = line.split(/\s+/);
      return { host, path, severity } as Entry;
    })
    .filter(e => e.host && e.path && e.severity);
}

function parseXml(text: string): Entry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const entries: Entry[] = [];
  doc.querySelectorAll('entry').forEach(node => {
    const host = node.querySelector('host')?.textContent?.trim() || '';
    const path = node.querySelector('path')?.textContent?.trim() || '';
    const severity = node.querySelector('severity')?.textContent?.trim() || '';
    if (host && path && severity) {
      entries.push({ host, path, severity });
    }
  });
  return entries;
}

export function parseEntries(text: string): Entry[] {
  // try XML first
  try {
    const xmlEntries = parseXml(text);
    if (xmlEntries.length) return xmlEntries;
  } catch {
    // ignore
  }
  return parseText(text);
}
