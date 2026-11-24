import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// @desc    Get all active categories for public storefront
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });

    // Include product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat.toObject(),
          productCount,
        };
      })
    );

    res.status(200).json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          productCount,
        };
      })
    );

    res.status(200).json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const productCount = await Product.countDocuments({ category: category._id, isActive: true });
    res.status(200).json({ success: true, category: { ...category.toObject(), productCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, displayOrder, isActive, subcategories } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    // Process subcategories
    let formattedSubcategories = [];
    if (Array.isArray(subcategories)) {
      formattedSubcategories = subcategories
        .filter((sub) => sub.name && sub.name.trim())
        .map((sub) => ({
          name: sub.name.trim(),
          slug: slugify(sub.name),
          isActive: sub.isActive !== undefined ? sub.isActive : true,
        }));
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
      image: image || '',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? isActive : true,
      subcategories: formattedSubcategories,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, displayOrder, isActive, subcategories } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name && name.trim() !== category.name) {
      category.name = name.trim();
      category.slug = slugify(name);
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    if (Array.isArray(subcategories)) {
      category.subcategories = subcategories
        .filter((sub) => sub.name && sub.name.trim())
        .map((sub) => ({
          name: sub.name.trim(),
          slug: slugify(sub.name),
          isActive: sub.isActive !== undefined ? sub.isActive : true,
        }));
    }

    await category.save();

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Safe delete category (checks if products belong to it)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if products are associated
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        requiresReassignment: true,
        productCount,
        message: `Cannot delete '${category.name}' because ${productCount} product(s) are currently assigned to it. Please reassign products to another category or archive this category instead.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: `Category '${category.name}' safely removed.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Reassign products to another category and delete old category
// @route   POST /api/categories/:id/reassign-and-delete
// @access  Private/Admin
export const reassignAndDeleteCategory = async (req, res, next) => {
  try {
    const { targetCategoryId } = req.body;
    const sourceCategory = await Category.findById(req.params.id);
    if (!sourceCategory) {
      return res.status(404).json({ success: false, message: 'Source category not found.' });
    }

    const targetCategory = await Category.findById(targetCategoryId);
    if (!targetCategory) {
      return res.status(404).json({ success: false, message: 'Target category for reassignment not found.' });
    }

    // Update all products to the target category
    await Product.updateMany({ category: sourceCategory._id }, { category: targetCategory._id });

    // Now delete source category
    await Category.findByIdAndDelete(sourceCategory._id);

    res.status(200).json({
      success: true,
      message: `Products successfully reassigned to '${targetCategory.name}' and '${sourceCategory.name}' has been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};
