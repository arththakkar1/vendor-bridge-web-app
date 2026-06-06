import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';

// Route imports
import authRouter from './modules/auth/auth.router';
import vendorRouter from './modules/vendors/vendors.router';
import rfqRouter from './modules/rfqs/rfqs.router';
import quotationRouter from './modules/quotations/quotations.router';
import approvalRouter from './modules/approvals/approvals.router';
import purchaseOrderRouter from './modules/purchase-orders/purchase-orders.router';
import invoiceRouter from './modules/invoices/invoices.router';
import activityLogRouter from './modules/activity-logs/activity-logs.router';
import analyticsRouter from './modules/analytics/analytics.router';
import usersRouter from './modules/users/users.router';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body / cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting on auth (increased for dev usage)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
});

// Routes
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/rfqs', rfqRouter);
app.use('/api/v1/quotations', quotationRouter);
app.use('/api/v1/approvals', approvalRouter);
app.use('/api/v1/purchase-orders', purchaseOrderRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/activity-logs', activityLogRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/users', usersRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler (must be last)
app.use(errorHandler);

export default app;