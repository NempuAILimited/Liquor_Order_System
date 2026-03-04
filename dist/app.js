"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const liquorRoutes_1 = __importDefault(require("./routes/liquorRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const pdfRoutes_1 = __importDefault(require("./routes/pdfRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 6001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (frontend)
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// API Routes
app.use('/api/liquor', liquorRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/pdf', pdfRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Liquor Order System is running' });
});
// Serve frontend for all other routes
app.get('/{*splat}', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'public', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════════╗
  ║     🍺 Liquor Order System - Running          ║
  ║     📍 http://localhost:${PORT}                  ║
  ║     📋 API: http://localhost:${PORT}/api/health  ║
  ╚════════════════════════════════════════════════╝
  `);
});
exports.default = app;
//# sourceMappingURL=app.js.map