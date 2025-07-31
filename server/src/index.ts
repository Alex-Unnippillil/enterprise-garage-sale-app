import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import propertyRoutes from "./routes/propertyRoutes";
import managerRoutes from "./routes/managerRoutes";
import tenantRoutes from "./routes/tenantRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import messageRoutes from "./routes/messageRoutes";
import maintenanceRoutes from "./routes/maintenanceRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import documentRoutes from "./routes/documentRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import searchRoutes from "./routes/searchRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import { generalLimiter, authLimiter, uploadLimiter } from "./middleware/rateLimiter";
import logger from "./middleware/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging middleware
app.use(logger.middleware());
app.use(logger.morganMiddleware());

// Rate limiting
app.use(generalLimiter.middleware());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with specific rate limiting
app.use("/api/properties", propertyRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Rentiful API is running!",
    version: process.env.APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Error handling middleware
app.use(logger.errorLogger());

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
