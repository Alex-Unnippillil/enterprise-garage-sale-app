import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { CLIENT_ORIGIN, PORT } from './env';
import { authMiddleware } from './middleware/auth-middleware';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import { featureFlagsMiddleware } from './middleware/feature-flags';

/* ROUTE IMPORT */
import tenantRoutes from './routes/tenant-routes';
import managerRoutes from './routes/manager-routes';
import propertyRoutes from './routes/property-routes';
import leaseRoutes from './routes/lease-routes';
import applicationRoutes from './routes/application-routes';
import flagRoutes from './routes/flag-routes';

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(cors({ origin: CLIENT_ORIGIN }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(featureFlagsMiddleware);

/* ROUTES */
app.get('/', (req, res) => {
  res.send('This is home route');
});

app.use('/applications', applicationRoutes);
app.use('/properties', propertyRoutes);
app.use('/leases', leaseRoutes);
app.use('/tenants', authMiddleware(['tenant']), tenantRoutes);
app.use('/managers', authMiddleware(['manager']), managerRoutes);
app.use('/flags', flagRoutes);

app.use(notFound);
app.use(errorHandler);

/* SERVER */
const port = PORT;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
