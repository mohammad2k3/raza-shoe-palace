import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products with full filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category, // slug or id
      subcategory,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      inStock,
      hasDiscount,
      search,
      sort,
      page = 1,
      limit = 12,
      featured,
      newArrival,
      bestSeller,
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) {
      // Check if it's an ObjectId or a slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isObjectId) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // No such category found
          return res.status(200).json({
            success: true,
            products: [],
            total: 0,
            totalPages: 0,
            currentPage: Number(page),
          });
        }
      }
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = new RegExp(`^${subcategory}$`, 'i');
    }

    // Brand filter (supports comma-separated)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.$or = [
        {
          salePrice: {
            $ne: null,
            ...(minPrice ? { $gte: Number(minPrice) } : {}),
            ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
          },
        },
        {
          salePrice: null,
          regularPrice: {
            ...(minPrice ? { $gte: Number(minPrice) } : {}),
            ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
          },
        },
      ];
    }

    // Variant size filter
    if (size) {
      const sizes = size.split(',').map((s) => s.trim());
      query['variants.size'] = { $in: sizes };
    }

    // Variant color filter
    if (color) {
      const colors = color.split(',').map((c) => c.trim());
      query['variants.color'] = { $in: colors.map((c) => new RegExp(`^${c}$`, 'i')) };
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      query['variants.stock'] = { $gt: 0 };
    }

    // Has discount filter
    if (hasDiscount === 'true' || hasDiscount === true) {
      query.$expr = { $and: [{ $gt: ['$salePrice', 0] }, { $lt: ['$salePrice', '$regularPrice'] }] };
    }

    // Flags
    if (featured === 'true' || featured === true) query.isFeatured = true;
    if (newArrival === 'true' || newArrival === true) query.isNewArrival = true;
    if (bestSeller === 'true' || bestSeller === true) query.isBestSeller = true;

    // Search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { sku: searchRegex },
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default newest first
    if (sort === 'price-asc') {
      sortObj = { salePrice: 1, regularPrice: 1 };
    } else if (sort === 'price-desc') {
      sortObj = { salePrice: -1, regularPrice: -1 };
    } else if (sort === 'rating' || sort === 'popular') {
      sortObj = { rating: -1, numReviews: -1 };
    } else if (sort === 'best-selling') {
      sortObj = { isBestSeller: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      products,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products for admin (includes inactive, no limit)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { search, category, stockStatus } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    let filtered = products;
    if (stockStatus === 'outOfStock') {
      filtered = products.filter((p) => p.totalStock === 0);
    } else if (stockStatus === 'lowStock') {
      filtered = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5);
    }

    res.status(200).json({ success: true, products: filtered, total: filtered.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or id
// @route   GET /api/products/:identifier
// @access  Public
export const getProductByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    const query = isObjectId ? { _id: identifier } : { slug: identifier.toLowerCase() };
    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const related = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4);

    res.status(200).json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      brand,
      category,
      subcategory,
      description,
      shortDescription,
      regularPrice,
      salePrice,
      images,
      variants,
      specifications,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
    } = req.body;

    if (!name || !regularPrice || !category) {
      return res.status(400).json({ success: false, message: 'Product name, category, and regular price are required.' });
    }

    // Generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Auto-generate SKU if not provided
    const productSku = sku ? sku.toUpperCase().trim() : `RSP-${Date.now().toString().slice(-6)}`;

    // Validate images
    const productImages = Array.isArray(images) && images.length > 0
      ? images
      : ['/images/placeholder-shoe.jpg'];

    // Ensure variants are formatted
    const formattedVariants = (Array.isArray(variants) ? variants : []).map((v) => ({
      size: String(v.size || '').trim(),
      color: String(v.color || 'Default').trim(),
      colorCode: v.colorCode || '#151515',
      stock: Math.max(0, parseInt(v.stock) || 0),
      sku: v.sku || `${productSku}-${v.size}-${v.color}`.toUpperCase(),
    }));

    const product = await Product.create({
      name: name.trim(),
      slug,
      sku: productSku,
      brand: brand ? brand.trim() : 'Raza Palace Collection',
      category,
      subcategory: subcategory || '',
      description: description || '',
      shortDescription: shortDescription || '',
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : null,
      images: productImages,
      variants: formattedVariants,
      specifications: Array.isArray(specifications) ? specifications : [],
      isFeatured: Boolean(isFeatured),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isBestSeller: Boolean(isBestSeller),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      sku,
      brand,
      category,
      subcategory,
      description,
      shortDescription,
      regularPrice,
      salePrice,
      images,
      variants,
      specifications,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
    } = req.body;

    if (name && name.trim() !== product.name) {
      product.name = name.trim();
      let baseSlug = slugify(name);
      let slug = baseSlug;
      let count = 1;
      while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
      product.slug = slug;
    }

    if (sku) product.sku = sku.toUpperCase().trim();
    if (brand !== undefined) product.brand = brand.trim();
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (regularPrice !== undefined) product.regularPrice = Number(regularPrice);
    if (salePrice !== undefined) product.salePrice = salePrice ? Number(salePrice) : null;
    if (Array.isArray(images) && images.length > 0) product.images = images;

    if (Array.isArray(variants)) {
      product.variants = variants.map((v) => ({
        size: String(v.size || '').trim(),
        color: String(v.color || 'Default').trim(),
        colorCode: v.colorCode || '#151515',
        stock: Math.max(0, parseInt(v.stock) || 0),
        sku: v.sku || `${product.sku}-${v.size}-${v.color}`.toUpperCase(),
      }));
    }

    if (Array.isArray(specifications)) product.specifications = specifications;
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isNewArrival !== undefined) product.isNewArrival = Boolean(isNewArrival);
    if (isBestSeller !== undefined) product.isBestSeller = Boolean(isBestSeller);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, message: `Product '${product.name}' deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update stock for a variant
// @route   PATCH /api/products/:id/variants/:variantId/stock
// @access  Private/Admin
export const updateVariantStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity required.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const variant = product.variants.id(req.params.variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    variant.stock = Number(stock);
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
