export interface Artifact {
  id: number;
  user: string;
  timestamp: string; // ISO timestamp
  type: string;
  description: string;
  value: number;
}
