export interface AppProfile {
  id: string;
  name: string;
}

export const profiles: AppProfile[] = [
  { id: "default", name: "Default" },
  { id: "work", name: "Work" },
];
