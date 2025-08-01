import express from 'express';
import { createProduct, getProductById, getAllProducts, deleteProduct } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin adds a product (requires authentication)
router.post('/', authenticateToken, createProduct);

// List products for authenticated merchant only
router.get('/', authenticateToken, getAllProducts);

// Get product details (public for payment links)
router.get('/:id', getProductById);

// Delete product (requires authentication)
router.delete('/:id', authenticateToken, deleteProduct);

export default router; 