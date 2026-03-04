import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteerCore from 'puppeteer-core';
import { Order } from '../types';
import { formatNumber, numberToWords } from '../utils/formatCurrency';
import { getCategoryLabel } from './liquorService';
import { getBarProfile } from './orderService';

// On Vercel, use /tmp (only writable directory); locally use project root
const OUTPUT_DIR = process.env.VERCEL
  ? path.join('/tmp', 'generated_pdfs')
  : path.join(process.cwd(), 'generated_pdfs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a PDF purchase order for the given order
 */
export async function generatePurchaseOrderPdf(order: Order): Promise<string> {
  // 1. Load the Handlebars template (use __dirname for Vercel ncc bundling compatibility)
  const templatePath = path.resolve(__dirname, '..', 'templates', 'purchaseRequest.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  const barProfile = getBarProfile();

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
      categoryLabel: getCategoryLabel(item.liquorItem.category),
      size: item.liquorItem.size,
      hsnCode: item.liquorItem.hsnCode,
      quantity: item.quantity,
      unitsPerCase: item.unitsPerCase,
      totalBottles: item.totalBottles,
      pricePerUnit: formatNumber(item.liquorItem.pricePerUnit),
      totalAmount: formatNumber(item.totalAmount),
      exciseAmount: formatNumber(item.exciseAmount),
    })),
    subtotal: formatNumber(order.subtotal),
    totalExcise: formatNumber(order.totalExcise),
    grandTotal: formatNumber(order.grandTotal),
    amountInWords: numberToWords(order.grandTotal),
  };

  // 3. Render HTML
  const html = template(templateData);

  // 4. Generate PDF using Puppeteer
  let browser;
  if (process.env.VERCEL) {
    // Serverless: use @sparticuz/chromium for Vercel
    const chromium = (await import('@sparticuz/chromium')).default;
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local dev: use system-installed puppeteer
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfFileName = `${order.orderNumber.replace(/\//g, '-')}_${Date.now()}.pdf`;
  const pdfPath = path.join(OUTPUT_DIR, pdfFileName);

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
