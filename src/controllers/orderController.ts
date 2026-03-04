import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import * as liquorService from '../services/liquorService';
import { CartItem } from '../types';

/**
 * POST /api/orders - Create a new order
 * Body: { items: [{ itemId: string, quantity: number, unitsPerCase?: number }] }
 */
export function createOrder(req: Request, res: Response): void {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order',
      });
      return;
    }

    const cartItems: CartItem[] = [];

    for (const item of items) {
      const liquorItem = liquorService.getItemById(item.itemId);
      if (!liquorItem) {
        res.status(400).json({
          success: false,
          message: `Item not found: ${item.itemId}`,
        });
        return;
      }

      const cartItem = orderService.calculateCartItem(
        liquorItem,
        item.quantity,
        item.unitsPerCase || 12
      );
      cartItems.push(cartItem);
    }

    const order = orderService.createOrder(cartItems);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
}

/**
 * GET /api/orders - Get all orders
 */
export function getAllOrders(req: Request, res: Response): void {
  const orders = orderService.getAllOrders();
  res.json({
    success: true,
    message: 'Orders fetched successfully',
    data: orders,
  });
}

/**
 * GET /api/orders/:id - Get single order
 */
export function getOrderById(req: Request, res: Response): void {
  const order = orderService.getOrderById(req.params.id as string);

  if (!order) {
    res.status(404).json({
      success: false,
      message: 'Order not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Order fetched successfully',
    data: order,
  });
}

/**
 * GET /api/orders/profile/bar - Get bar profile
 */
export function getBarProfile(req: Request, res: Response): void {
  const profile = orderService.getBarProfile();
  res.json({
    success: true,
    message: 'Bar profile fetched',
    data: profile,
  });
}
