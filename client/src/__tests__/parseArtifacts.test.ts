import { parseArtifacts } from '@/lib/parseArtifacts';

describe('parseArtifacts', () => {
  it('parses valid artifact array', () => {
    const json = [
      { id: 1, user: 'alice', timestamp: '2024-01-01T00:00:00Z', type: 'listing', description: 'test', value: 10 },
    ];
    const result = parseArtifacts(json);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ user: 'alice', value: 10 });
  });

  it('returns empty array for invalid data', () => {
    const result = parseArtifacts({});
    expect(result).toEqual([]);
  });
});
