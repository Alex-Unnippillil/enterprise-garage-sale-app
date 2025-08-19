export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TENANT = 'tenant',
}

export const permissions: Record<Role, string[]> = {
  [Role.ADMIN]: ['manage_users', 'manage_listings', 'view_listings'],
  [Role.MANAGER]: ['manage_listings', 'view_listings'],
  [Role.TENANT]: ['view_listings'],
};

export type Permission = (typeof permissions)[Role][number];
