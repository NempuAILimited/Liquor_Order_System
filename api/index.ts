import express from 'express';
import cors from 'cors';

import liquorRoutes from '../src/routes/liquorRoutes';
import orderRoutes from '../src/routes/orderRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/liquor', liquorRoutes);
app.use('/api/orders', orderRoutes);

// PDF routes - lazy loaded to avoid bundling puppeteer on cold start
app.use('/api/pdf', async (req, res, next) => {
  try {
    const pdfRoutes = (await import('../src/routes/pdfRoutes')).default;
    pdfRoutes(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Liquor Order System is running' });
});

export default app;
