import { Router } from 'express';
import * as pdfController from '../controllers/pdfController';

const router = Router();

router.post('/generate/:orderId', pdfController.generatePdf);

export default router;
