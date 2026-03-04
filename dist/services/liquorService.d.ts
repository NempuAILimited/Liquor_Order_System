import { LiquorItem, LiquorCategory } from '../types';
/**
 * Get all liquor items from the catalog
 */
export declare function getAllItems(): LiquorItem[];
/**
 * Get a single liquor item by ID
 */
export declare function getItemById(id: string): LiquorItem | undefined;
/**
 * Get liquor items filtered by category
 */
export declare function getItemsByCategory(category: LiquorCategory): LiquorItem[];
/**
 * Search liquor items by name or brand
 */
export declare function searchItems(query: string): LiquorItem[];
/**
 * Get all unique categories
 */
export declare function getCategories(): LiquorCategory[];
/**
 * Get a friendly label for a category
 */
export declare function getCategoryLabel(category: LiquorCategory): string;
//# sourceMappingURL=liquorService.d.ts.map