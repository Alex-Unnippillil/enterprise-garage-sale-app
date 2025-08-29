export interface AppTile {
  id: string;
  title: string;
  url: string;
  color?: string;
}

export const DEFAULT_TILES: AppTile[] = [
  { id: 'docs', title: 'Documentation', url: '/docs', color: 'bg-blue-500' },
  { id: 'faq', title: 'FAQ', url: '/faq', color: 'bg-green-500' },
  { id: 'support', title: 'Support', url: '/support', color: 'bg-purple-500' },
];
