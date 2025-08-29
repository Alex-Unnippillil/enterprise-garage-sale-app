import { buildPropertyFilters } from "../utils/build-property-filters";
import { PropertyType, Amenity } from "@prisma/client";

describe("buildPropertyFilters", () => {
  it("handles favoriteIds", () => {
    const filters = buildPropertyFilters({ favoriteIds: "1,2" });
    expect(filters).toEqual({ id: { in: [1, 2] } });
  });

  it("handles price range", () => {
    const filters = buildPropertyFilters({ priceMin: "100", priceMax: "500" });
    expect(filters.pricePerMonth).toMatchObject({ gte: 100, lte: 500 });
  });

  it("handles beds and baths", () => {
    const filters = buildPropertyFilters({ beds: "2", baths: "1" });
    expect(filters.beds).toEqual({ gte: 2 });
    expect(filters.baths).toEqual({ gte: 1 });
  });

  it("handles square footage", () => {
    const filters = buildPropertyFilters({ squareFeetMin: "500", squareFeetMax: "1000" });
    expect(filters.squareFeet).toMatchObject({ gte: 500, lte: 1000 });
  });

  it("handles property type", () => {
    const filters = buildPropertyFilters({ propertyType: PropertyType.Apartment });
    expect(filters.propertyType).toBe(PropertyType.Apartment);
  });

  it("handles multiple property types", () => {
    const filters = buildPropertyFilters({
      propertyType: `${PropertyType.Apartment},${PropertyType.Villa}`,
    });
    expect(filters.propertyType).toEqual({
      in: [PropertyType.Apartment, PropertyType.Villa],
    });
  });

  it("handles amenities", () => {
    const filters = buildPropertyFilters({ amenities: `${Amenity.WasherDryer},${Amenity.Gym}` });
    expect(filters.amenities).toEqual({ hasEvery: [Amenity.WasherDryer, Amenity.Gym] });
  });

  it("handles availableFrom", () => {
    const date = new Date().toISOString();
    const filters = buildPropertyFilters({ availableFrom: date });
    expect(filters.leases).toEqual({ some: { startDate: { lte: new Date(date) } } });
  });

  it("handles locationIds", () => {
    const filters = buildPropertyFilters({ locationIds: [1, 2] });
    expect(filters.locationId).toEqual({ in: [1, 2] });
  });

  it("handles q search", () => {
    const filters = buildPropertyFilters({ q: "home" });
    expect(filters.OR).toEqual([
      { name: { contains: "home", mode: "insensitive" } },
      { description: { contains: "home", mode: "insensitive" } },
    ]);
  });
});
