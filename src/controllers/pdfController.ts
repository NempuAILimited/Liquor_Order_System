import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import { generatePurchaseOrderHtml } from '../services/pdfService';

/**
 * POST /api/pdf/generate/:orderId - Generate PDF HTML for an order
 * Returns the rendered HTML that the client uses to generate PDF
 */
export function generatePdf(req: Request, res: Response): void {
  try {
    const order = orderService.getOrderById(req.params.orderId as string);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const html = generatePurchaseOrderHtml(order);

    // Update order status
    orderService.updateOrderStatus(order.id, 'PDF_GENERATED');

    res.json({
      success: true,
      message: 'PDF HTML generated successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        html: html,
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
