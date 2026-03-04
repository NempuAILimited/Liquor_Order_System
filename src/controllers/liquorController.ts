import { Request, Response } from 'express';
import * as liquorService from '../services/liquorService';
import { LiquorCategory } from '../types';

/**
 * GET /api/liquor - Get all liquor items
 */
export function getAllItems(req: Request, res: Response): void {
  const { category, search } = req.query;

  let items;

  if (search && typeof search === 'string') {
    items = liquorService.searchItems(search);
  } else if (category && typeof category === 'string') {
    items = liquorService.getItemsByCategory(category as LiquorCategory);
  } else {
    items = liquorService.getAllItems();
  }

  res.json({
    success: true,
    message: 'Liquor items fetched successfully',
    data: items,
  });
}

/**
 * GET /api/liquor/categories - Get all categories
 */
export function getCategories(req: Request, res: Response): void {
  const categories = liquorService.getCategories().map(cat => ({
    value: cat,
    label: liquorService.getCategoryLabel(cat),
  }));

  res.json({
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });
}

/**
 * GET /api/liquor/:id - Get single item
 */
export function getItemById(req: Request, res: Response): void {
  const item = liquorService.getItemById(req.params.id as string);

  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Item not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Item fetched successfully',
    data: item,
  });
}
