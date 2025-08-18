import { Request, Response, NextFunction } from 'express';
import { Prisma, Location } from '@prisma/client';
import { buildPropertyFilters } from '../utils/build-property-filters';
import { formatLocation } from '../utils/format-location';
import { uploadFilesToS3 } from '../utils/s3-upload';
import { geocodeAddress } from '../utils/geocode-address';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  AWS_REGION,
  S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from '../env';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const createPropertySchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  name: z.string(),
  description: z.string(),
  pricePerMonth: z.coerce.number(),
  securityDeposit: z.coerce.number(),
  applicationFee: z.coerce.number(),
  beds: z.coerce.number(),
  baths: z.coerce.number(),
  squareFeet: z.coerce.number(),
  propertyType: z.string(),
  amenities: z.string().optional(),
  highlights: z.string().optional(),
  isPetsAllowed: z.coerce.boolean().optional(),
  isParkingIncluded: z.coerce.boolean().optional(),
});

const updatePropertySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  pricePerMonth: z.coerce.number().optional(),
  securityDeposit: z.coerce.number().optional(),
  applicationFee: z.coerce.number().optional(),
  beds: z.coerce.number().optional(),
  baths: z.coerce.number().optional(),
  squareFeet: z.coerce.number().optional(),
  propertyType: z.string().optional(),
  amenities: z.string().optional(),
  highlights: z.string().optional(),
  isPetsAllowed: z.coerce.boolean().optional(),
  isParkingIncluded: z.coerce.boolean().optional(),
  photoUrls: z.array(z.string()).optional(),
});

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
      q,
    } = req.query;

    let locationIds: number[] | undefined;
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111;
      const results: { id: number }[] = await prisma.$queryRaw`
        SELECT id FROM "Location"
        WHERE ST_DWithin(
          coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )
      `;
      locationIds = results.map((r) => r.id);
    }

    const filters = buildPropertyFilters({
      favoriteIds: favoriteIds as string | undefined,
      priceMin: priceMin as string | undefined,
      priceMax: priceMax as string | undefined,
      beds: beds as string | undefined,
      baths: baths as string | undefined,
      propertyType: propertyType as string | undefined,
      squareFeetMin: squareFeetMin as string | undefined,
      squareFeetMax: squareFeetMax as string | undefined,
      amenities: amenities as string | undefined,
      availableFrom: availableFrom as string | undefined,
      locationIds,
      q: q as string | undefined,
    });

    const properties = await prisma.property.findMany({
      where: filters,
      include: { location: true },
    });

    const locIds = properties.map((p) => p.locationId);
    let coordsMap = new Map<number, { longitude: number; latitude: number }>();
    if (locIds.length > 0) {
      const coordsResults: {
        id: number;
        longitude: number;
        latitude: number;
      }[] = await prisma.$queryRaw`
        SELECT id,
               ST_X(coordinates::geometry) as longitude,
               ST_Y(coordinates::geometry) as latitude
        FROM "Location"
        WHERE id IN (${Prisma.join(locIds)})
      `;
      coordsMap = new Map(
        coordsResults.map((c) => [
          c.id,
          { longitude: Number(c.longitude), latitude: Number(c.latitude) },
        ]),
      );
    }

    const propertiesWithCoordinates = properties.map((p) => ({
      ...p,
      location: {
        ...p.location,
        coordinates: coordsMap.get(p.locationId),
      },
    }));
    res.json(propertiesWithCoordinates);
  } catch (err) {
    next(err);
  }
};

export const getProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const { longitude, latitude } = await formatLocation(property.location.id);

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (err) {
    next(err);
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    const parsed = createPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }

    const managerCognitoId = req.user?.id;
    if (!managerCognitoId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { address, city, state, country, postalCode, ...propertyData } = parsed.data;

    const photoUrls = await uploadFilesToS3(files);

    const [longitude, latitude] = await geocodeAddress(address, city, country, postalCode);

    const newProperty = await prisma.$transaction(async (tx) => {
      const [location] = await tx.$queryRaw<Location[]>`
        INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
        VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode},
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
      `;

      return tx.property.create({
        data: {
          ...propertyData,
          photoUrls,
          locationId: location.id,
          managerCognitoId,
          propertyType: propertyData.propertyType as any,
          amenities:
            typeof propertyData.amenities === 'string'
              ? (propertyData.amenities.split(',') as any)
              : [],
          highlights:
            typeof propertyData.highlights === 'string'
              ? (propertyData.highlights.split(',') as any)
              : [],
          isPetsAllowed: propertyData.isPetsAllowed,
          isParkingIncluded: propertyData.isParkingIncluded,
          pricePerMonth: propertyData.pricePerMonth,
          securityDeposit: propertyData.securityDeposit,
          applicationFee: propertyData.applicationFee,
          beds: propertyData.beds,
          baths: propertyData.baths,
          squareFeet: propertyData.squareFeet,
        },
        include: {
          location: true,
          manager: true,
        },
      });
    });

    res.status(201).json(newProperty);
  } catch (err) {
    next(err);
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.managerCognitoId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;
    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: {
        ...data,
        propertyType: (data as any).propertyType,
        amenities:
          typeof data.amenities === 'string'
            ? (data.amenities.split(',') as any)
            : (data.amenities as any),
        highlights:
          typeof data.highlights === 'string'
            ? (data.highlights.split(',') as any)
            : (data.highlights as any),
        isPetsAllowed: data.isPetsAllowed,
        isParkingIncluded: data.isParkingIncluded,
      },
    });

    res.json(updatedProperty);
  } catch (err) {
    next(err);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.managerCognitoId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    for (const url of property.photoUrls) {
      try {
        const parsed = new URL(url);
        let Key = parsed.pathname.replace(/^\/+/g, '');
        if (Key.startsWith(`${S3_BUCKET_NAME}/`)) {
          Key = Key.slice(S3_BUCKET_NAME.length + 1);
        }
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key }),
        );
      } catch {
        // ignore errors from invalid URLs or S3 deletions
      }
    }

    await prisma.property.delete({ where: { id: Number(id) } });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
};
