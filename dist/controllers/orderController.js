"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getAllOrders = getAllOrders;
exports.getOrderById = getOrderById;
exports.getBarProfile = getBarProfile;
const orderService = __importStar(require("../services/orderService"));
const liquorService = __importStar(require("../services/liquorService"));
/**
 * POST /api/orders - Create a new order
 * Body: { items: [{ itemId: string, quantity: number, unitsPerCase?: number }] }
 */
function createOrder(req, res) {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please add at least one item to your order',
            });
            return;
        }
        const cartItems = [];
        for (const item of items) {
            const liquorItem = liquorService.getItemById(item.itemId);
            if (!liquorItem) {
                res.status(400).json({
                    success: false,
                    message: `Item not found: ${item.itemId}`,
                });
                return;
            }
            const cartItem = orderService.calculateCartItem(liquorItem, item.quantity, item.unitsPerCase || 12);
            cartItems.push(cartItem);
        }
        const order = orderService.createOrder(cartItems);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order,
        });
    }
    catch (error) {
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
function getAllOrders(req, res) {
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
function getOrderById(req, res) {
    const order = orderService.getOrderById(req.params.id);
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
function getBarProfile(req, res) {
    const profile = orderService.getBarProfile();
    res.json({
        success: true,
        message: 'Bar profile fetched',
        data: profile,
    });
}
//# sourceMappingURL=orderController.js.map