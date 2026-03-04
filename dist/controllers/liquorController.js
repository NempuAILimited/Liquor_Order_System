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
exports.getAllItems = getAllItems;
exports.getCategories = getCategories;
exports.getItemById = getItemById;
const liquorService = __importStar(require("../services/liquorService"));
/**
 * GET /api/liquor - Get all liquor items
 */
function getAllItems(req, res) {
    const { category, search } = req.query;
    let items;
    if (search && typeof search === 'string') {
        items = liquorService.searchItems(search);
    }
    else if (category && typeof category === 'string') {
        items = liquorService.getItemsByCategory(category);
    }
    else {
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
function getCategories(req, res) {
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
function getItemById(req, res) {
    const item = liquorService.getItemById(req.params.id);
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
//# sourceMappingURL=liquorController.js.map