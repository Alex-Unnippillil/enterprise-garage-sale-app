import { XMLParser } from 'fast-xml-parser';

interface VulnRecord {
  host: string;
  vuln: string;
  cvss: number;
}

self.onmessage = (event: MessageEvent<string>) => {
  const xml = event.data;
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const jsObj = parser.parse(xml);
  const reportHosts = jsObj?.NessusClientData_v2?.Report?.ReportHost || [];
  const hostsArray = Array.isArray(reportHosts) ? reportHosts : [reportHosts];
  const results: VulnRecord[] = [];

  for (const host of hostsArray) {
    const hostName = host?.['@_name'] || host?.name || '';
    const items = host?.ReportItem || [];
    const itemsArray = Array.isArray(items) ? items : [items];
    for (const item of itemsArray) {
      const vulnName = item?.['@_pluginName'] || item?.plugin_name || item?.name || '';
      const cvssRaw = item?.cvss3_base_score || item?.cvss_base_score || item?.cvss_score || '0';
      const cvss = parseFloat(cvssRaw) || 0;
      results.push({ host: hostName, vuln: vulnName, cvss });
    }
  }

  postMessage(results);
};

export default null as any;
