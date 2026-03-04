import { v4 as uuidv4 } from 'uuid';
import { Order, CartItem, LiquorItem, OrderStatus, BarProfile } from '../types';
import { generateOrderNumber, getFormattedDate } from '../utils/formatCurrency';
import barProfileData from '../data/barProfile.json';

const barProfile: BarProfile = barProfileData as BarProfile;

// In-memory store for orders (in production, use a database)
const orders: Map<string, Order> = new Map();

/**
 * Calculate cart item totals
 */
export function calculateCartItem(
  liquorItem: LiquorItem,
  quantity: number,
  unitsPerCase: number = 12
): CartItem {
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
export function createOrder(cartItems: CartItem[]): Order {
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalExcise = cartItems.reduce((sum, item) => sum + item.exciseAmount, 0);
  const grandTotal = subtotal + totalExcise;

  const order: Order = {
    id: uuidv4(),
    orderNumber: generateOrderNumber(),
    barLicenseNumber: barProfile.barLicenseNumber,
    barName: barProfile.barName,
    barAddress: barProfile.barAddress,
    ownerName: barProfile.ownerName,
    contactNumber: barProfile.contactNumber,
    orderDate: getFormattedDate(),
    items: cartItems,
    subtotal,
    totalExcise,
    grandTotal,
    status: 'DRAFT' as OrderStatus,
    createdAt: new Date().toISOString(),
  };

  orders.set(order.id, order);
  return order;
}

/**
 * Get an order by ID
 */
export function getOrderById(id: string): Order | undefined {
  return orders.get(id);
}

/**
 * Get all orders
 */
export function getAllOrders(): Order[] {
  return Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update order status
 */
export function updateOrderStatus(id: string, status: OrderStatus, pdfPath?: string): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;

  order.status = status;
  if (pdfPath) order.pdfPath = pdfPath;
  orders.set(id, order);
  return order;
}

/**
 * Get bar profile info
 */
export function getBarProfile(): BarProfile {
  return barProfile;
}
