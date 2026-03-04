"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = generatePdf;
exports.downloadPdf = downloadPdf;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const orderService = __importStar(require("../services/orderService"));
const pdfService_1 = require("../services/pdfService");
/**
 * POST /api/pdf/generate/:orderId - Generate PDF for an order
 */
async function generatePdf(req, res) {
    try {
        const order = orderService.getOrderById(req.params.orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
            return;
        }
        const pdfPath = await (0, pdfService_1.generatePurchaseOrderPdf)(order);
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
    }
    catch (error) {
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
function downloadPdf(req, res) {
    const order = orderService.getOrderById(req.params.orderId);
    if (!order || !order.pdfPath) {
        res.status(404).json({
            success: false,
            message: 'PDF not found. Please generate it first.',
        });
        return;
    }
    if (!fs_1.default.existsSync(order.pdfPath)) {
        res.status(404).json({
            success: false,
            message: 'PDF file not found on server',
        });
        return;
    }
    const fileName = path_1.default.basename(order.pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(order.pdfPath);
}
//# sourceMappingURL=pdfController.js.map