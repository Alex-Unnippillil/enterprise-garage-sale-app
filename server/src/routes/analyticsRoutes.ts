import express from "express";
import {
  getRevenueAnalytics,
  getPropertyAnalytics,
  getApplicationAnalytics,
  getMaintenanceAnalytics,
  getTenantAnalytics,
  getMessageAnalytics,
  getDashboardMetrics,
} from "../controllers/analyticsControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Analytics routes - only accessible by managers
router.get("/revenue", authMiddleware(["manager"]), getRevenueAnalytics);
router.get("/properties", authMiddleware(["manager"]), getPropertyAnalytics);
router.get("/applications", authMiddleware(["manager"]), getApplicationAnalytics);
router.get("/maintenance", authMiddleware(["manager"]), getMaintenanceAnalytics);
router.get("/tenants", authMiddleware(["manager"]), getTenantAnalytics);
router.get("/messages", authMiddleware(["manager"]), getMessageAnalytics);
router.get("/dashboard", authMiddleware(["manager"]), getDashboardMetrics);

// Combined analytics endpoint
router.get("/", authMiddleware(["manager"]), async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "30";
    const managerId = req.user?.id;

    const [
      revenueData,
      propertyData,
      applicationData,
      maintenanceData,
      tenantData,
      messageData
    ] = await Promise.all([
      getRevenueAnalytics(req, res, true),
      getPropertyAnalytics(req, res, true),
      getApplicationAnalytics(req, res, true),
      getMaintenanceAnalytics(req, res, true),
      getTenantAnalytics(req, res, true),
      getMessageAnalytics(req, res, true)
    ]);

    res.json({
      revenue: revenueData,
      properties: propertyData,
      applications: applicationData,
      maintenance: maintenanceData,
      tenants: tenantData,
      messages: messageData
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
});

export default router; 