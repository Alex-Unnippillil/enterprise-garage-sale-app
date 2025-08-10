import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response
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
      page = "1",
      limit = "10",
    } = req.query;

    const where: any = {};

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string)
        .split(",")
        .map(Number);
      where.id = { in: favoriteIdsArray };
    }

    if (priceMin || priceMax) {
      where.pricePerMonth = {};
      if (priceMin) where.pricePerMonth.gte = Number(priceMin);
      if (priceMax) where.pricePerMonth.lte = Number(priceMax);
    }

    if (beds && beds !== "any") {
      where.beds = { gte: Number(beds) };
    }

    if (baths && baths !== "any") {
      where.baths = { gte: Number(baths) };
    }

    if (squareFeetMin || squareFeetMax) {
      where.squareFeet = {};
      if (squareFeetMin) where.squareFeet.gte = Number(squareFeetMin);
      if (squareFeetMax) where.squareFeet.lte = Number(squareFeetMax);
    }

    if (propertyType && propertyType !== "any") {
      where.propertyType = propertyType;
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      where.amenities = { hasEvery: amenitiesArray };
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? new Date(availableFrom) : null;
      if (availableFromDate && !isNaN(availableFromDate.getTime())) {
        where.leases = { some: { startDate: { lte: availableFromDate } } };
      }
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { location: true },
        skip,
        take,
      }),
      prisma.property.count({ where }),
    ]);

    await Promise.all(
      properties.map(async (property: any) => {
        const coords: { longitude: number; latitude: number }[] =
          await prisma.$queryRaw`
          SELECT ST_X(coordinates::geometry) as longitude, ST_Y(coordinates::geometry) as latitude
          FROM "Location" WHERE id = ${property.locationId}
        `;
        property.location = {
          ...property.location,
          coordinates: coords[0] || { longitude: null, latitude: null },
        };
      })
    );

    const pageCount = Math.ceil(totalCount / limitNumber);
    res.setHeader("X-Total-Count", totalCount.toString());
    res.setHeader("X-Page-Count", pageCount.toString());
    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
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
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
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
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};
