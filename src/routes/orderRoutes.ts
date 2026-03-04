import { Router } from 'express';
import * as orderController from '../controllers/orderController';

const router = Router();

router.get('/profile/bar', orderController.getBarProfile);
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

export default router;
