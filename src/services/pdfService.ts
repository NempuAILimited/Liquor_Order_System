import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Order } from '../types';
import { formatNumber, numberToWords } from '../utils/formatCurrency';
import { getCategoryLabel } from './liquorService';
import { getBarProfile } from './orderService';

/**
 * Generate the HTML for a purchase order (used for client-side PDF generation)
 */
export function generatePurchaseOrderHtml(order: Order): string {
  // Load the Handlebars template
  let templatePath = path.resolve(__dirname, '..', 'templates', 'purchaseRequest.hbs');
  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(process.cwd(), 'src', 'templates', 'purchaseRequest.hbs');
  }
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  const barProfile = getBarProfile();

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

  return template(templateData);
}
