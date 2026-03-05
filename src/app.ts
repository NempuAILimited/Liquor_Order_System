import express from 'express';
import cors from 'cors';
import path from 'path';

import liquorRoutes from './routes/liquorRoutes';
import orderRoutes from './routes/orderRoutes';
import pdfRoutes from './routes/pdfRoutes';

const app = express();
const PORT = process.env.PORT || 6001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/liquor', liquorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Liquor Order System is running' });
});

// Static files & catch-all
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Only start listening when not running as a Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════════╗
  ║     🍺 Liquor Order System - Running          ║
  ║     📍 http://localhost:${PORT}                  ║
  ║     📋 API: http://localhost:${PORT}/api/health  ║
  ╚════════════════════════════════════════════════╝
    `);
  });
}

export default app;
