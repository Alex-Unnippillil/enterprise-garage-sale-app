export interface ListingCreationPayload {
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  amenities?: string;
  highlights?: string;
  isPetsAllowed?: boolean;
  isParkingIncluded?: boolean;
  photos?: File[];
}

export interface PropertyFilters {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
}

export interface PropertyFilterParams {
  favoriteIds?: string;
  priceMin?: string;
  priceMax?: string;
  beds?: string;
  baths?: string;
  propertyType?: string;
  squareFeetMin?: string;
  squareFeetMax?: string;
  amenities?: string;
  availableFrom?: string;
  locationIds?: number[];
  q?: string;
}
