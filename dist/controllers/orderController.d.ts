import { Request, Response } from 'express';
/**
 * POST /api/orders - Create a new order
 * Body: { items: [{ itemId: string, quantity: number, unitsPerCase?: number }] }
 */
export declare function createOrder(req: Request, res: Response): void;
/**
 * GET /api/orders - Get all orders
 */
export declare function getAllOrders(req: Request, res: Response): void;
/**
 * GET /api/orders/:id - Get single order
 */
export declare function getOrderById(req: Request, res: Response): void;
/**
 * GET /api/orders/profile/bar - Get bar profile
 */
export declare function getBarProfile(req: Request, res: Response): void;
//# sourceMappingURL=orderController.d.ts.map