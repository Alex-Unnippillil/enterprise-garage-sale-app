import { Request, Response } from "express";
import { PrismaClient, PropertyType, Amenity, Highlight } from "@prisma/client";

const prisma = new PrismaClient();

// Advanced property search with multiple filters
export const searchProperties = async (req: Request, res: Response) => {
  try {
    const {
      query,
      minPrice,
      maxPrice,
      minBeds,
      maxBeds,
      minBaths,
      maxBaths,
      propertyType,
      amenities,
      highlights,
      petsAllowed,
      parkingIncluded,
      city,
      state,
      postalCode,
      radius,
      latitude,
      longitude,
      availableFrom,
      availableTo,
      sortBy = 'postedDate',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      isAvailable: true
    };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
        { location: { address: { contains: query as string, mode: 'insensitive' } } },
        { location: { city: { contains: query as string, mode: 'insensitive' } } },
        { location: { state: { contains: query as string, mode: 'insensitive' } } }
      ];
    }

    // Price range
    if (minPrice) where.pricePerMonth = { gte: Number(minPrice) };
    if (maxPrice) {
      where.pricePerMonth = { 
        ...where.pricePerMonth, 
        lte: Number(maxPrice) 
      };
    }

    // Bedrooms
    if (minBeds) where.beds = { gte: Number(minBeds) };
    if (maxBeds) {
      where.beds = { 
        ...where.beds, 
        lte: Number(maxBeds) 
      };
    }

    // Bathrooms
    if (minBaths) where.baths = { gte: Number(minBaths) };
    if (maxBaths) {
      where.baths = { 
        ...where.baths, 
        lte: Number(maxBaths) 
      };
    }

    // Property type
    if (propertyType) where.propertyType = propertyType as PropertyType;

    // Amenities
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      where.amenities = { hasSome: amenityArray as Amenity[] };
    }

    // Highlights
    if (highlights) {
      const highlightArray = Array.isArray(highlights) ? highlights : [highlights];
      where.highlights = { hasSome: highlightArray as Highlight[] };
    }

    // Pets and parking
    if (petsAllowed !== undefined) where.isPetsAllowed = petsAllowed === 'true';
    if (parkingIncluded !== undefined) where.isParkingIncluded = parkingIncluded === 'true';

    // Location filters
    if (city) where.location = { city: { contains: city as string, mode: 'insensitive' } };
    if (state) where.location = { ...where.location, state: { contains: state as string, mode: 'insensitive' } };
    if (postalCode) where.location = { ...where.location, postalCode: { contains: postalCode as string } };

    // Availability
    if (availableFrom) {
      where.leases = {
        none: {
          OR: [
            { startDate: { lte: new Date(availableFrom as string) }, endDate: { gte: new Date(availableFrom as string) } },
            { startDate: { lte: new Date(availableTo as string) }, endDate: { gte: new Date(availableTo as string) } }
          ]
        }
      };
    }

    // Sort options
    const orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.pricePerMonth = sortOrder;
        break;
      case 'beds':
        orderBy.beds = sortOrder;
        break;
      case 'rating':
        orderBy.averageRating = sortOrder;
        break;
      case 'date':
        orderBy.postedDate = sortOrder;
        break;
      default:
        orderBy.postedDate = sortOrder;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        },
        _count: {
          select: {
            reviews: true,
            applications: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy
    });

    const total = await prisma.property.count({ where });

    // Calculate distance if coordinates provided
    let propertiesWithDistance = properties;
    if (latitude && longitude && radius) {
      propertiesWithDistance = properties.map(property => {
        const distance = calculateDistance(
          Number(latitude),
          Number(longitude),
          property.location.coordinates
        );
        return { ...property, distance };
      }).filter(property => property.distance <= Number(radius));
    }

    res.json({
      properties: propertiesWithDistance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      filters: {
        query,
        minPrice,
        maxPrice,
        minBeds,
        maxBeds,
        minBaths,
        maxBaths,
        propertyType,
        amenities,
        highlights,
        petsAllowed,
        parkingIncluded,
        city,
        state,
        postalCode,
        radius,
        latitude,
        longitude,
        availableFrom,
        availableTo
      }
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
};

// Search by location
export const searchByLocation = async (req: Request, res: Response) => {
  try {
    const { city, state, postalCode, radius, latitude, longitude } = req.query;

    const where: any = { isAvailable: true };

    if (city) where.location = { city: { contains: city as string, mode: 'insensitive' } };
    if (state) where.location = { ...where.location, state: { contains: state as string, mode: 'insensitive' } };
    if (postalCode) where.location = { ...where.location, postalCode: { contains: postalCode as string } };

    const properties = await prisma.property.findMany({
      where,
      include: {
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    let filteredProperties = properties;
    if (latitude && longitude && radius) {
      filteredProperties = properties
        .map(property => ({
          ...property,
          distance: calculateDistance(
            Number(latitude),
            Number(longitude),
            property.location.coordinates
          )
        }))
        .filter(property => property.distance <= Number(radius))
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({
      properties: filteredProperties,
      total: filteredProperties.length
    });
  } catch (error) {
    console.error('Error searching by location:', error);
    res.status(500).json({ error: 'Failed to search by location' });
  }
};

// Search by price range
export const searchByPrice = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice, sortBy = 'pricePerMonth' } = req.query;

    const where: any = { isAvailable: true };

    if (minPrice) where.pricePerMonth = { gte: Number(minPrice) };
    if (maxPrice) {
      where.pricePerMonth = { 
        ...where.pricePerMonth, 
        lte: Number(maxPrice) 
      };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      },
      orderBy: { pricePerMonth: sortBy === 'desc' ? 'desc' : 'asc' }
    });

    res.json({
      properties,
      total: properties.length,
      priceRange: {
        min: Math.min(...properties.map(p => p.pricePerMonth)),
        max: Math.max(...properties.map(p => p.pricePerMonth)),
        average: properties.reduce((sum, p) => sum + p.pricePerMonth, 0) / properties.length
      }
    });
  } catch (error) {
    console.error('Error searching by price:', error);
    res.status(500).json({ error: 'Failed to search by price' });
  }
};

// Search by amenities
export const searchByAmenities = async (req: Request, res: Response) => {
  try {
    const { amenities } = req.query;

    if (!amenities) {
      return res.status(400).json({ error: 'Amenities parameter is required' });
    }

    const amenityArray = Array.isArray(amenities) ? amenities : [amenities];

    const properties = await prisma.property.findMany({
      where: {
        isAvailable: true,
        amenities: { hasSome: amenityArray as Amenity[] }
      },
      include: {
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    res.json({
      properties,
      total: properties.length,
      amenities: amenityArray
    });
  } catch (error) {
    console.error('Error searching by amenities:', error);
    res.status(500).json({ error: 'Failed to search by amenities' });
  }
};

// Search by availability
export const searchByAvailability = async (req: Request, res: Response) => {
  try {
    const { availableFrom, availableTo } = req.query;

    if (!availableFrom || !availableTo) {
      return res.status(400).json({ error: 'Available from and to dates are required' });
    }

    const properties = await prisma.property.findMany({
      where: {
        isAvailable: true,
        leases: {
          none: {
            OR: [
              { startDate: { lte: new Date(availableFrom as string) }, endDate: { gte: new Date(availableFrom as string) } },
              { startDate: { lte: new Date(availableTo as string) }, endDate: { gte: new Date(availableTo as string) } }
            ]
          }
        }
      },
      include: {
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    res.json({
      properties,
      total: properties.length,
      availability: {
        from: availableFrom,
        to: availableTo
      }
    });
  } catch (error) {
    console.error('Error searching by availability:', error);
    res.status(500).json({ error: 'Failed to search by availability' });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query as string;

    // Get city suggestions
    const cities = await prisma.location.findMany({
      where: {
        city: { contains: searchTerm, mode: 'insensitive' }
      },
      select: { city: true },
      distinct: ['city'],
      take: 5
    });

    // Get property name suggestions
    const properties = await prisma.property.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' }
      },
      select: { name: true },
      take: 5
    });

    // Get neighborhood suggestions
    const neighborhoods = await prisma.location.findMany({
      where: {
        neighborhood: { contains: searchTerm, mode: 'insensitive' }
      },
      select: { neighborhood: true },
      distinct: ['neighborhood'],
      take: 5
    });

    const suggestions = [
      ...cities.map(c => ({ type: 'city', value: c.city })),
      ...properties.map(p => ({ type: 'property', value: p.name })),
      ...neighborhoods.map(n => ({ type: 'neighborhood', value: n.neighborhood }))
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
};

// Get popular searches
export const getPopularSearches = async (req: Request, res: Response) => {
  try {
    // This would typically come from a search analytics table
    // For now, we'll return some common searches
    const popularSearches = [
      { term: 'Downtown', count: 150 },
      { term: 'Studio', count: 120 },
      { term: 'Pet Friendly', count: 95 },
      { term: 'Parking Included', count: 85 },
      { term: 'Balcony', count: 75 },
      { term: 'Gym', count: 65 },
      { term: 'Pool', count: 55 },
      { term: 'Furnished', count: 45 }
    ];

    res.json({ popularSearches });
  } catch (error) {
    console.error('Error getting popular searches:', error);
    res.status(500).json({ error: 'Failed to get popular searches' });
  }
};

// Save search
export const saveSearch = async (req: Request, res: Response) => {
  try {
    const { name, filters } = req.body;
    const userId = req.user?.cognitoId;

    // This would typically save to a saved searches table
    // For now, we'll just return success
    res.json({ 
      message: 'Search saved successfully',
      savedSearch: { id: Date.now(), name, filters, userId }
    });
  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({ error: 'Failed to save search' });
  }
};

// Get saved searches
export const getSavedSearches = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.cognitoId;

    // This would typically fetch from a saved searches table
    // For now, we'll return mock data
    const savedSearches = [
      { id: 1, name: 'Downtown Apartments', filters: { city: 'Downtown', maxPrice: 2000 } },
      { id: 2, name: 'Pet Friendly Properties', filters: { petsAllowed: true } },
      { id: 3, name: 'Studio Apartments', filters: { minBeds: 0, maxBeds: 1 } }
    ];

    res.json({ savedSearches });
  } catch (error) {
    console.error('Error getting saved searches:', error);
    res.status(500).json({ error: 'Failed to get saved searches' });
  }
};

// Delete saved search
export const deleteSavedSearch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.cognitoId;

    // This would typically delete from a saved searches table
    res.json({ message: 'Search deleted successfully' });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({ error: 'Failed to delete saved search' });
  }
};

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, coordinates: any): number {
  // This is a simplified distance calculation
  // In a real implementation, you'd use a proper geospatial library
  if (!coordinates) return Infinity;
  
  // Parse coordinates (assuming they're stored as a geography point)
  // This is a placeholder implementation
  const lat2 = 0; // Extract from coordinates
  const lon2 = 0; // Extract from coordinates
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
} 