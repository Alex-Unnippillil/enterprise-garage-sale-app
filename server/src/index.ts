import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth-middleware";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import env from "./env";
/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenant-routes";
import managerRoutes from "./routes/manager-routes";
import propertyRoutes from "./routes/property-routes";
import leaseRoutes from "./routes/lease-routes";
import applicationRoutes from "./routes/application-routes";

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

app.use(notFound);
app.use(errorHandler);

/* SERVER */
const port = env.PORT;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
