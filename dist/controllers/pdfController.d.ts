import { Request, Response } from 'express';
/**
 * POST /api/pdf/generate/:orderId - Generate PDF for an order
 */
export declare function generatePdf(req: Request, res: Response): Promise<void>;
/**
 * GET /api/pdf/download/:orderId - Download the generated PDF
 */
export declare function downloadPdf(req: Request, res: Response): void;
//# sourceMappingURL=pdfController.d.ts.map