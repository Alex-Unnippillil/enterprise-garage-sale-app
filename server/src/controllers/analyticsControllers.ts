import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const managerId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        paymentStatus: "Paid",
        paymentDate: {
          gte: startDate,
        },
        lease: {
          property: {
            managerCognitoId: managerId,
          },
        },
      },
      _sum: {
        amountPaid: true,
      },
    });

    // Get previous period revenue for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - timeRange);
    
    const previousRevenue = await prisma.payment.aggregate({
      where: {
        paymentStatus: "Paid",
        paymentDate: {
          gte: previousStartDate,
          lt: startDate,
        },
        lease: {
          property: {
            managerCognitoId: managerId,
          },
        },
      },
      _sum: {
        amountPaid: true,
      },
    });

    // Calculate percentage change
    const currentRevenue = totalRevenue._sum.amountPaid || 0;
    const prevRevenue = previousRevenue._sum.amountPaid || 0;
    const change = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Get monthly revenue data
    const monthlyRevenue = await prisma.payment.groupBy({
      by: ["paymentDate"],
      where: {
        paymentStatus: "Paid",
        paymentDate: {
          gte: startDate,
        },
        lease: {
          property: {
            managerCognitoId: managerId,
          },
        },
      },
      _sum: {
        amountPaid: true,
      },
      orderBy: {
        paymentDate: "asc",
      },
    });

    const monthlyData = monthlyRevenue.map((item) => ({
      month: item.paymentDate.toLocaleDateString("en-US", { month: "short" }),
      amount: item._sum.amountPaid || 0,
    }));

    const data = {
      total: currentRevenue,
      change: Math.round(change * 100) / 100,
      monthly: monthlyData,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Revenue analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  }
};

export const getPropertyAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const managerId = req.user?.id;

    // Get property counts
    const totalProperties = await prisma.property.count({
      where: {
        managerCognitoId: managerId,
      },
    });

    const occupiedProperties = await prisma.property.count({
      where: {
        managerCognitoId: managerId,
        leases: {
          some: {
            isActive: true,
          },
        },
      },
    });

    const vacantProperties = totalProperties - occupiedProperties;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    const data = {
      total: totalProperties,
      occupied: occupiedProperties,
      vacant: vacantProperties,
      occupancyRate,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Property analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch property analytics" });
    }
  }
};

export const getApplicationAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const managerId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get application counts by status
    const applications = await prisma.application.groupBy({
      by: ["status"],
      where: {
        applicationDate: {
          gte: startDate,
        },
        property: {
          managerCognitoId: managerId,
        },
      },
      _count: {
        id: true,
      },
    });

    const total = applications.reduce((sum, app) => sum + app._count.id, 0);
    const pending = applications.find(app => app.status === "Pending")?._count.id || 0;
    const approved = applications.find(app => app.status === "Approved")?._count.id || 0;
    const rejected = applications.find(app => app.status === "Denied")?._count.id || 0;

    // Get monthly application data
    const monthlyApplications = await prisma.application.groupBy({
      by: ["applicationDate"],
      where: {
        applicationDate: {
          gte: startDate,
        },
        property: {
          managerCognitoId: managerId,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        applicationDate: "asc",
      },
    });

    const monthlyData = monthlyApplications.map((item) => ({
      month: item.applicationDate.toLocaleDateString("en-US", { month: "short" }),
      count: item._count.id,
    }));

    const data = {
      total,
      pending,
      approved,
      rejected,
      monthly: monthlyData,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Application analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch application analytics" });
    }
  }
};

export const getMaintenanceAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const managerId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get maintenance counts by status
    const maintenanceRequests = await prisma.maintenanceRequest.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: startDate,
        },
        managerCognitoId: managerId,
      },
      _count: {
        id: true,
      },
    });

    const total = maintenanceRequests.reduce((sum, req) => sum + req._count.id, 0);
    const pending = maintenanceRequests.find(req => req.status === "Pending")?._count.id || 0;
    const inProgress = maintenanceRequests.find(req => req.status === "InProgress")?._count.id || 0;
    const completed = maintenanceRequests.find(req => req.status === "Completed")?._count.id || 0;

    // Get monthly maintenance data
    const monthlyMaintenance = await prisma.maintenanceRequest.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: startDate,
        },
        managerCognitoId: managerId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const monthlyData = monthlyMaintenance.map((item) => ({
      month: item.createdAt.toLocaleDateString("en-US", { month: "short" }),
      count: item._count.id,
    }));

    const data = {
      total,
      pending,
      inProgress,
      completed,
      monthly: monthlyData,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Maintenance analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch maintenance analytics" });
    }
  }
};

export const getTenantAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const managerId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get active tenants
    const activeTenants = await prisma.tenant.count({
      where: {
        leases: {
          some: {
            isActive: true,
            property: {
              managerCognitoId: managerId,
            },
          },
        },
      },
    });

    // Get new tenants this month
    const newTenants = await prisma.tenant.count({
      where: {
        leases: {
          some: {
            startDate: {
              gte: startDate,
            },
            property: {
              managerCognitoId: managerId,
            },
          },
        },
      },
    });

    // Calculate retention rate (simplified)
    const totalTenants = await prisma.tenant.count({
      where: {
        leases: {
          some: {
            property: {
              managerCognitoId: managerId,
            },
          },
        },
      },
    });

    const retentionRate = totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0;

    const data = {
      total: totalTenants,
      active: activeTenants,
      newThisMonth: newTenants,
      retentionRate,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Tenant analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch tenant analytics" });
    }
  }
};

export const getMessageAnalytics = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const managerId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get message counts
    const totalMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        OR: [
          { senderId: managerId },
          { receiverId: managerId },
        ],
      },
    });

    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: managerId,
        status: "Sent",
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate response rate (simplified)
    const sentMessages = await prisma.message.count({
      where: {
        senderId: managerId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    const responseRate = totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0;

    // Calculate average response time (simplified)
    const avgResponseTime = 2.5; // Mock data - in real app, calculate from actual response times

    const data = {
      total: totalMessages,
      unread: unreadMessages,
      responseRate,
      avgResponseTime,
    };

    if (returnData) {
      return data;
    }

    res.json(data);
  } catch (error: any) {
    console.error("Message analytics error:", error);
    if (!returnData) {
      res.status(500).json({ message: "Failed to fetch message analytics" });
    }
  }
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const managerId = req.user?.id;

    // Get quick metrics for dashboard
    const [
      totalProperties,
      activeLeases,
      pendingApplications,
      pendingMaintenance,
      totalRevenue,
      unreadMessages
    ] = await Promise.all([
      prisma.property.count({
        where: { managerCognitoId: managerId }
      }),
      prisma.lease.count({
        where: {
          isActive: true,
          property: { managerCognitoId: managerId }
        }
      }),
      prisma.application.count({
        where: {
          status: "Pending",
          property: { managerCognitoId: managerId }
        }
      }),
      prisma.maintenanceRequest.count({
        where: {
          status: "Pending",
          managerCognitoId: managerId
        }
      }),
      prisma.payment.aggregate({
        where: {
          paymentStatus: "Paid",
          lease: {
            property: { managerCognitoId: managerId }
          }
        },
        _sum: { amountPaid: true }
      }),
      prisma.message.count({
        where: {
          receiverId: managerId,
          status: "Sent"
        }
      })
    ]);

    res.json({
      totalProperties,
      activeLeases,
      pendingApplications,
      pendingMaintenance,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      unreadMessages
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard metrics" });
  }
}; 