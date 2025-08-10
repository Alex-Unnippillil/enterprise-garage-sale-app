import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";
import { PORT } from "./config";
/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import listingsRoutes from "./routes/listings";

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/listings", listingsRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
