import { Property } from './prisma-types';

export interface Favorite {
  id: number;
  tenantId: number;
  propertyId: number;
  property: Property;
}
