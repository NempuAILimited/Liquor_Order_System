"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllItems = getAllItems;
exports.getItemById = getItemById;
exports.getItemsByCategory = getItemsByCategory;
exports.searchItems = searchItems;
exports.getCategories = getCategories;
exports.getCategoryLabel = getCategoryLabel;
const liquorCatalog_json_1 = __importDefault(require("../data/liquorCatalog.json"));
const catalog = liquorCatalog_json_1.default;
/**
 * Get all liquor items from the catalog
 */
function getAllItems() {
    return catalog;
}
/**
 * Get a single liquor item by ID
 */
function getItemById(id) {
    return catalog.find(item => item.id === id);
}
/**
 * Get liquor items filtered by category
 */
function getItemsByCategory(category) {
    return catalog.filter(item => item.category === category);
}
/**
 * Search liquor items by name or brand
 */
function searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return catalog.filter(item => item.name.toLowerCase().includes(lowerQuery) ||
        item.brand.toLowerCase().includes(lowerQuery));
}
/**
 * Get all unique categories
 */
function getCategories() {
    const categories = new Set(catalog.map(item => item.category));
    return Array.from(categories);
}
/**
 * Get a friendly label for a category
 */
function getCategoryLabel(category) {
    const labels = {
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
//# sourceMappingURL=liquorService.js.map