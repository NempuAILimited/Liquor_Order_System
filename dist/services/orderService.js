"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCartItem = calculateCartItem;
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.getAllOrders = getAllOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.getBarProfile = getBarProfile;
const uuid_1 = require("uuid");
const formatCurrency_1 = require("../utils/formatCurrency");
const barProfile_json_1 = __importDefault(require("../data/barProfile.json"));
const barProfile = barProfile_json_1.default;
// In-memory store for orders (in production, use a database)
const orders = new Map();
/**
 * Calculate cart item totals
 */
function calculateCartItem(liquorItem, quantity, unitsPerCase = 12) {
    const totalBottles = quantity * unitsPerCase;
    const totalAmount = totalBottles * liquorItem.pricePerUnit;
    const exciseAmount = totalBottles * liquorItem.exciseDuty;
    return {
        liquorItem,
        quantity,
        unitsPerCase,
        totalBottles,
        totalAmount,
        exciseAmount,
    };
}
/**
 * Create a new order from cart items
 */
function createOrder(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalExcise = cartItems.reduce((sum, item) => sum + item.exciseAmount, 0);
    const grandTotal = subtotal + totalExcise;
    const order = {
        id: (0, uuid_1.v4)(),
        orderNumber: (0, formatCurrency_1.generateOrderNumber)(),
        barLicenseNumber: barProfile.barLicenseNumber,
        barName: barProfile.barName,
        barAddress: barProfile.barAddress,
        ownerName: barProfile.ownerName,
        contactNumber: barProfile.contactNumber,
        orderDate: (0, formatCurrency_1.getFormattedDate)(),
        items: cartItems,
        subtotal,
        totalExcise,
        grandTotal,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
    };
    orders.set(order.id, order);
    return order;
}
/**
 * Get an order by ID
 */
function getOrderById(id) {
    return orders.get(id);
}
/**
 * Get all orders
 */
function getAllOrders() {
    return Array.from(orders.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
/**
 * Update order status
 */
function updateOrderStatus(id, status, pdfPath) {
    const order = orders.get(id);
    if (!order)
        return undefined;
    order.status = status;
    if (pdfPath)
        order.pdfPath = pdfPath;
    orders.set(id, order);
    return order;
}
/**
 * Get bar profile info
 */
function getBarProfile() {
    return barProfile;
}
//# sourceMappingURL=orderService.js.map