import { Request, Response } from "express";
import { PrismaClient, ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus as updateApplicationStatusService } from "../services/applicationService";

const prisma = new PrismaClient();

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    let whereClause = {};

    if (userId && userType) {
      if (userType === "tenant") {
        whereClause = { tenantCognitoId: String(userId) };
      } else if (userType === "manager") {
        whereClause = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            location: true,
            manager: true,
          },
        },
        tenant: true,
      },
    });

    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    const formattedApplications = await Promise.all(
      applications.map(async (app) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: {
              cognitoId: app.tenantCognitoId,
            },
            propertyId: app.propertyId,
          },
          orderBy: { startDate: "desc" },
        });

        return {
          ...app,
          property: {
            ...app.property,
            address: app.property.location.address,
          },
          manager: app.property.manager,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      })
    );

    res.json(formattedApplications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving applications: ${error.message}` });
  }
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      applicationDate,
      status,
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { pricePerMonth: true, securityDeposit: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const newApplication = await prisma.$transaction(async (prisma) => {
      // Create lease first
      const lease = await prisma.lease.create({
        data: {
          startDate: new Date(), // Today
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ), // 1 year from today
          rent: property.pricePerMonth,
          deposit: property.securityDeposit,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
      });

      // Then create application with lease connection
      const application = await prisma.application.create({
        data: {
          applicationDate: new Date(applicationDate),
          status,
          name,
          email,
          phoneNumber,
          message,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
          lease: {
            connect: { id: lease.id },
          },
        },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });

      return application;
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating application: ${error.message}` });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedApplication = await updateApplicationStatusService(
      Number(id),
      status as ApplicationStatus
    );

    res.json(updatedApplication);
  } catch (error: any) {
    if (error.message === "Application not found") {
      res.status(404).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: `Error updating application status: ${error.message}` });
    }
  }
};
