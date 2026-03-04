import { Router } from 'express';
import * as liquorController from '../controllers/liquorController';

const router = Router();

router.get('/', liquorController.getAllItems);
router.get('/categories', liquorController.getCategories);
router.get('/:id', liquorController.getItemById);

export default router;
