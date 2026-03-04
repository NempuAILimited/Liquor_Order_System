"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePurchaseOrderPdf = generatePurchaseOrderPdf;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const formatCurrency_1 = require("../utils/formatCurrency");
const liquorService_1 = require("./liquorService");
const orderService_1 = require("./orderService");
// Ensure the output directory exists
const OUTPUT_DIR = path_1.default.join(process.cwd(), 'generated_pdfs');
if (!fs_1.default.existsSync(OUTPUT_DIR)) {
    fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
}
/**
 * Generate a PDF purchase order for the given order
 */
async function generatePurchaseOrderPdf(order) {
    // 1. Load the Handlebars template (resolve from project root, not dist)
    const templatePath = path_1.default.join(process.cwd(), 'src', 'templates', 'purchaseRequest.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    const template = handlebars_1.default.compile(templateSource);
    const barProfile = (0, orderService_1.getBarProfile)();
    // 2. Prepare template data
    const templateData = {
        barName: order.barName,
        barAddress: order.barAddress,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        barLicenseNumber: order.barLicenseNumber,
        ownerName: order.ownerName,
        contactNumber: order.contactNumber,
        gstin: barProfile.gstin,
        items: order.items.map((item, index) => ({
            serialNo: index + 1,
            name: item.liquorItem.name,
            brand: item.liquorItem.brand,
            categoryLabel: (0, liquorService_1.getCategoryLabel)(item.liquorItem.category),
            size: item.liquorItem.size,
            hsnCode: item.liquorItem.hsnCode,
            quantity: item.quantity,
            unitsPerCase: item.unitsPerCase,
            totalBottles: item.totalBottles,
            pricePerUnit: (0, formatCurrency_1.formatNumber)(item.liquorItem.pricePerUnit),
            totalAmount: (0, formatCurrency_1.formatNumber)(item.totalAmount),
            exciseAmount: (0, formatCurrency_1.formatNumber)(item.exciseAmount),
        })),
        subtotal: (0, formatCurrency_1.formatNumber)(order.subtotal),
        totalExcise: (0, formatCurrency_1.formatNumber)(order.totalExcise),
        grandTotal: (0, formatCurrency_1.formatNumber)(order.grandTotal),
        amountInWords: (0, formatCurrency_1.numberToWords)(order.grandTotal),
    };
    // 3. Render HTML
    const html = template(templateData);
    // 4. Generate PDF using Puppeteer
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfFileName = `${order.orderNumber.replace(/\//g, '-')}_${Date.now()}.pdf`;
    const pdfPath = path_1.default.join(OUTPUT_DIR, pdfFileName);
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '10mm',
            bottom: '10mm',
            left: '10mm',
            right: '10mm',
        },
    });
    await browser.close();
    console.log(`PDF generated: ${pdfPath}`);
    return pdfPath;
}
//# sourceMappingURL=pdfService.js.map