import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import * as orderService from '../services/orderService';
import { generatePurchaseOrderPdf } from '../services/pdfService';

/**
 * POST /api/pdf/generate/:orderId - Generate PDF for an order
 */
export async function generatePdf(req: Request, res: Response): Promise<void> {
  try {
    const order = orderService.getOrderById(req.params.orderId as string);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const pdfPath = await generatePurchaseOrderPdf(order);

    // Update order status
    orderService.updateOrderStatus(order.id, 'PDF_GENERATED', pdfPath);

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        pdfPath: pdfPath,
        downloadUrl: `/api/pdf/download/${order.id}`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
    });
  }
}

/**
 * GET /api/pdf/download/:orderId - Download the generated PDF
 */
export function downloadPdf(req: Request, res: Response): void {
  const order = orderService.getOrderById(req.params.orderId as string);

  if (!order || !order.pdfPath) {
    res.status(404).json({
      success: false,
      message: 'PDF not found. Please generate it first.',
    });
    return;
  }

  if (!fs.existsSync(order.pdfPath)) {
    res.status(404).json({
      success: false,
      message: 'PDF file not found on server',
    });
    return;
  }

  const fileName = path.basename(order.pdfPath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.sendFile(order.pdfPath);
}
