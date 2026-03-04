import { Order, CartItem, LiquorItem, OrderStatus, BarProfile } from '../types';
/**
 * Calculate cart item totals
 */
export declare function calculateCartItem(liquorItem: LiquorItem, quantity: number, unitsPerCase?: number): CartItem;
/**
 * Create a new order from cart items
 */
export declare function createOrder(cartItems: CartItem[]): Order;
/**
 * Get an order by ID
 */
export declare function getOrderById(id: string): Order | undefined;
/**
 * Get all orders
 */
export declare function getAllOrders(): Order[];
/**
 * Update order status
 */
export declare function updateOrderStatus(id: string, status: OrderStatus, pdfPath?: string): Order | undefined;
/**
 * Get bar profile info
 */
export declare function getBarProfile(): BarProfile;
//# sourceMappingURL=orderService.d.ts.map