import { Router } from 'express';
import * as pdfController from '../controllers/pdfController';

const router = Router();

router.post('/generate/:orderId', pdfController.generatePdf);
router.get('/download/:orderId', pdfController.downloadPdf);

export default router;
