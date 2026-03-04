import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Order } from '../types';
import { formatNumber, numberToWords } from '../utils/formatCurrency';
import { getCategoryLabel } from './liquorService';
import { getBarProfile } from './orderService';

function getOutputDir(): string {
  const dir = process.env.VERCEL
    ? path.join('/tmp', 'generated_pdfs')
    : path.join(process.cwd(), 'generated_pdfs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Generate a PDF purchase order for the given order
 */
export async function generatePurchaseOrderPdf(order: Order): Promise<string> {
  // 1. Load the Handlebars template
  // On Vercel, the template is included via vercel.json includeFiles
  // Locally (after build), it's in dist/templates/ (copied during build)
  // In dev mode (ts-node), it's in src/templates/
  let templatePath = path.resolve(__dirname, '..', 'templates', 'purchaseRequest.hbs');
  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(process.cwd(), 'src', 'templates', 'purchaseRequest.hbs');
  }
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

  // 4. Generate PDF using Puppeteer (lazy-loaded to avoid cold start overhead)
  let browser;
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import('puppeteer')).default;
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const OUTPUT_DIR = getOutputDir();
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
