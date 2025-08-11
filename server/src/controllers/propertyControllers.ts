import { Request, Response, NextFunction } from "express";
import { Prisma, Location } from "@prisma/client";
import { buildPropertyFilters } from "../utils/buildPropertyFilters";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import prisma from "../prismaClient";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
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
        ])
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
  next: NextFunction
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
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

    const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
    const longitude = geoJSON.coordinates[0];
    const latitude = geoJSON.coordinates[1];

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
      res.status(404).json({ message: "Property not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      })
    );

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com",
      },
    });
    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0];

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err) {
    next(err);
  }
};
