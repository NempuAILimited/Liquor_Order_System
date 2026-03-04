import { LiquorItem, LiquorCategory } from '../types';
import catalogData from '../data/liquorCatalog.json';

const catalog: LiquorItem[] = catalogData as LiquorItem[];

/**
 * Get all liquor items from the catalog
 */
export function getAllItems(): LiquorItem[] {
  return catalog;
}

/**
 * Get a single liquor item by ID
 */
export function getItemById(id: string): LiquorItem | undefined {
  return catalog.find(item => item.id === id);
}

/**
 * Get liquor items filtered by category
 */
export function getItemsByCategory(category: LiquorCategory): LiquorItem[] {
  return catalog.filter(item => item.category === category);
}

/**
 * Search liquor items by name or brand
 */
export function searchItems(query: string): LiquorItem[] {
  const lowerQuery = query.toLowerCase();
  return catalog.filter(
    item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all unique categories
 */
export function getCategories(): LiquorCategory[] {
  const categories = new Set(catalog.map(item => item.category));
  return Array.from(categories) as LiquorCategory[];
}

/**
 * Get a friendly label for a category
 */
export function getCategoryLabel(category: LiquorCategory): string {
  const labels: Record<LiquorCategory, string> = {
    IMFL_WHISKY: 'IMFL - Whisky',
    IMFL_RUM: 'IMFL - Rum',
    IMFL_VODKA: 'IMFL - Vodka',
    IMFL_GIN: 'IMFL - Gin',
    IMFL_BRANDY: 'IMFL - Brandy',
    BEER: 'Beer',
    WINE: 'Wine',
    COUNTRY_LIQUOR: 'Country Liquor',
  };
  return labels[category] || category;
}
