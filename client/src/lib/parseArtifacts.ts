import { Artifact } from '@/types/artifact';

export function parseArtifacts(data: unknown): Artifact[] {
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    id: Number(item.id),
    user: String(item.user),
    timestamp: String(item.timestamp),
    type: String(item.type),
    description: String(item.description),
    value: Number(item.value),
  }));
}
