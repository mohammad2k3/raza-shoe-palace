import express from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reassignAndDeleteCategory,
} from '../controllers/categoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/admin/all', protect, requireAdmin, getAllCategoriesAdmin);
router.get('/:slug', getCategoryBySlug);

router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);
router.post('/:id/reassign-and-delete', protect, requireAdmin, reassignAndDeleteCategory);

export default router;
