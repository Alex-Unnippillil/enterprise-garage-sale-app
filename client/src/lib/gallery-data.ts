export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  code: string;
  stacks: string[];
  year: number;
}

export const galleryData: GalleryItem[] = [
  {
    id: 'search-feature',
    title: 'Search Feature',
    image: '/landing-search1.png',
    code: `function search(query: string) {
  return fetch('/api/search?q=' + query);
}`,
    stacks: ['nextjs', 'typescript'],
    year: 2024,
  },
  {
    id: 'listing-card',
    title: 'Listing Card',
    image: '/landing-i1.png',
    code: `export const ListingCard = () => <div>Listing</div>;`,
    stacks: ['react', 'tailwind'],
    year: 2023,
  },
];
