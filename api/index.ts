import express from 'express';
import cors from 'cors';

import liquorRoutes from '../src/routes/liquorRoutes';
import orderRoutes from '../src/routes/orderRoutes';
import pdfRoutes from '../src/routes/pdfRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/liquor', liquorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Liquor Order System is running' });
});

export default app;
