import express from 'express';
import {
  getProducts,
  getAllProductsAdmin,
  getProductByIdentifier,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariantStock,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/admin/all', protect, requireAdmin, getAllProductsAdmin);
router.get('/:identifier', getProductByIdentifier);
router.get('/:id/related', getRelatedProducts);

router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);
router.patch('/:id/variants/:variantId/stock', protect, requireAdmin, updateVariantStock);

export default router;
