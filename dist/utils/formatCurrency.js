"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatNumber = formatNumber;
exports.generateOrderNumber = generateOrderNumber;
exports.getFormattedDate = getFormattedDate;
exports.numberToWords = numberToWords;
/**
 * Format a number as Indian Rupees currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}
/**
 * Format number in Indian numbering system (with lakhs/crores)
 */
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}
/**
 * Generate an order number like PO-2026-0001
 */
function generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PO-${year}-${random}`;
}
/**
 * Get current date formatted as DD/MM/YYYY (Indian format)
 */
function getFormattedDate(date) {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
/**
 * Convert number to words (for Indian Rupees)
 */
function numberToWords(num) {
    if (num === 0)
        return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const whole = Math.floor(num);
    const paise = Math.round((num - whole) * 100);
    function convertToWords(n) {
        if (n === 0)
            return '';
        if (n < 20)
            return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000)
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
        if (n < 100000)
            return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
        if (n < 10000000)
            return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
        return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
    }
    let result = 'Rupees ' + convertToWords(whole);
    if (paise > 0) {
        result += ' and ' + convertToWords(paise) + ' Paise';
    }
    result += ' Only';
    return result;
}
//# sourceMappingURL=formatCurrency.js.map