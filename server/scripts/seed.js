import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { Banner } from '../models/Banner.js';
import { Coupon } from '../models/Coupon.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raza_shoe_palace';

const initialCategories = [
  {
    name: "Men's Shoes",
    slug: 'mens-shoes',
    description: 'Refined, timeless footwear handcrafted for modern gentlemen.',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isActive: true,
    subcategories: [
      { name: 'Oxfords', slug: 'oxfords', isActive: true },
      { name: 'Derbies', slug: 'derbies', isActive: true },
      { name: 'Brogues', slug: 'brogues', isActive: true },
      { name: 'Monk Straps', slug: 'monk-straps', isActive: true },
    ],
  },
  {
    name: 'Sports Shoes',
    slug: 'sports-shoes',
    description: 'High-performance athletic footwear engineered for speed, endurance, and comfort.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isActive: true,
    subcategories: [
      { name: 'Running Shoes', slug: 'running-shoes', isActive: true },
      { name: 'Training & Gym', slug: 'training-gym', isActive: true },
      { name: 'Walking Shoes', slug: 'walking-shoes', isActive: true },
    ],
  },
  {
    name: 'Casual Shoes',
    slug: 'casual-shoes',
    description: 'Everyday comfort crafted with premium leathers and versatile silhouettes.',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isActive: true,
    subcategories: [
      { name: 'Loafers', slug: 'loafers', isActive: true },
      { name: 'Boat Shoes', slug: 'boat-shoes', isActive: true },
      { name: 'Slip-ons', slug: 'slip-ons', isActive: true },
    ],
  },
  {
    name: 'Formal Shoes',
    slug: 'formal-shoes',
    description: 'Executive class, high-shine dress shoes tailored for boardroom meetings and black-tie galas.',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    isActive: true,
    subcategories: [
      { name: 'Patent Leather', slug: 'patent-leather', isActive: true },
      { name: 'Cap Toe Oxfords', slug: 'cap-toe-oxfords', isActive: true },
      { name: 'Tuxedo Loafers', slug: 'tuxedo-loafers', isActive: true },
    ],
  },
  {
    name: 'Sneakers',
    slug: 'sneakers',
    description: 'Iconic street style meets artisan luxury. Clean lines, breathable cushions, and premium suede.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    isActive: true,
    subcategories: [
      { name: 'Low Tops', slug: 'low-tops', isActive: true },
      { name: 'High Tops', slug: 'high-tops', isActive: true },
      { name: 'Chunky Sole', slug: 'chunky-sole', isActive: true },
    ],
  },
  {
    name: 'Sandals & Slippers',
    slug: 'sandals-slippers',
    description: 'Relaxed ergonomics, molded footbeds, and soft Italian calfskin slides.',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
    displayOrder: 6,
    isActive: true,
    subcategories: [
      { name: 'Leather Sandals', slug: 'leather-sandals', isActive: true },
      { name: 'Comfort Slides', slug: 'comfort-slides', isActive: true },
      { name: 'Mules', slug: 'mules', isActive: true },
    ],
  },
];

const initialBanners = [
  {
    title: 'Step Into Style.',
    subtitle: 'The 2026 Sovereign Footwear Collection',
    tagline: 'HANDCRAFTED EXCELLENCE',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Shop New Arrivals',
    link: '/shop?newArrival=true',
    type: 'hero',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Italian Calfskin Formals',
    subtitle: 'Precision Tailored for Boardrooms & Celebrations',
    tagline: 'LIMITED EDITION',
    imageUrl: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Explore Formal',
    link: '/shop?category=formal-shoes',
    type: 'hero',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'Mid-Season Luxury Footwear Gala',
    subtitle: 'Enjoy up to 25% off on selected handcrafted dress shoes and sneakers.',
    tagline: 'CURATED PRIVILEGE',
    imageUrl: 'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Claim Your Privilege',
    link: '/shop?hasDiscount=true',
    type: 'promo',
    displayOrder: 1,
    isActive: true,
  },
];

const initialCoupons = [
  {
    code: 'RAZAWELCOME',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 1000,
    validUntil: new Date('2028-12-31'),
    isActive: true,
  },
  {
    code: 'STEPINTOSTYLE',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 2999,
    validUntil: new Date('2028-12-31'),
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB at', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // 1. Seed or update store settings
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: 'RAZA SHOE PALACE',
        tagline: 'Step Into Style.',
        email: 'contact@razashoepalace.com',
        phone: '+91 98765 43210',
        address: 'Main Market Road, Footwear Galleria, Suite 101',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        shippingFee: 99,
        freeShippingThreshold: 1999,
        announcementText: '✨ Welcome to Raza Shoe Palace — Free Express Shipping on orders above ₹1,999 | Use Code: RAZAWELCOME',
        announcementActive: true,
        currencySymbol: '₹',
        returnWindowDays: 7,
      });
      console.log('[Seed] Created default Store Settings.');
    } else {
      console.log('[Seed] Store settings already present.');
    }

    // 2. Seed Admin user
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@razashoepalace.com').toLowerCase();
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'Raza Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@Raza2026!',
        phone: process.env.ADMIN_PHONE || '+919876543210',
        role: 'admin',
      });
      console.log(`[Seed] Initial Admin created: ${adminEmail} (password: ${process.env.ADMIN_PASSWORD || 'Admin@Raza2026!'})`);
    } else {
      console.log(`[Seed] Admin user (${adminEmail}) already exists.`);
    }

    // 3. Seed Categories
    const categoryDocs = {};
    for (const cat of initialCategories) {
      let existingCat = await Category.findOne({ slug: cat.slug });
      if (!existingCat) {
        existingCat = await Category.create(cat);
        console.log(`[Seed] Created category: ${cat.name}`);
      } else {
        console.log(`[Seed] Category already exists: ${cat.name}`);
      }
      categoryDocs[cat.slug] = existingCat;
    }

    // 4. Seed Banners
    for (const b of initialBanners) {
      const existing = await Banner.findOne({ title: b.title });
      if (!existing) {
        await Banner.create(b);
        console.log(`[Seed] Created banner: ${b.title}`);
      }
    }

    // 5. Seed Coupons
    for (const c of initialCoupons) {
      const existing = await Coupon.findOne({ code: c.code });
      if (!existing) {
        await Coupon.create(c);
        console.log(`[Seed] Created coupon: ${c.code}`);
      }
    }

    // 6. Seed Sample Footwear Catalog (if product collection is empty)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Seed] Seeding initial premium footwear products...');

      const sampleProducts = [
        {
          name: 'The Sovereign Cap-Toe Oxford',
          slug: 'sovereign-cap-toe-oxford',
          sku: 'RSP-OXF-001',
          brand: 'Raza Heritage',
          category: categoryDocs['formal-shoes']?._id,
          subcategory: 'Cap Toe Oxfords',
          description:
            'A quintessential formal masterpiece hand-lasted from full-grain French calfskin leather. Featuring closed-channel Goodyear welt construction, Argentine leather soles, and a memory foam infused footbed for unmatched prestige and effortless comfort all day.',
          shortDescription: 'Full-grain French calfskin with Goodyear welted Argentine leather sole.',
          regularPrice: 6999,
          salePrice: 5499,
          images: [
            'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Black', colorCode: '#151515', stock: 8, sku: 'RSP-OXF-001-UK7-BLK' },
            { size: 'UK 8', color: 'Black', colorCode: '#151515', stock: 12, sku: 'RSP-OXF-001-UK8-BLK' },
            { size: 'UK 9', color: 'Black', colorCode: '#151515', stock: 10, sku: 'RSP-OXF-001-UK9-BLK' },
            { size: 'UK 10', color: 'Black', colorCode: '#151515', stock: 6, sku: 'RSP-OXF-001-UK10-BLK' },
            { size: 'UK 8', color: 'Cognac Brown', colorCode: '#6B3E26', stock: 5, sku: 'RSP-OXF-001-UK8-BRN' },
            { size: 'UK 9', color: 'Cognac Brown', colorCode: '#6B3E26', stock: 4, sku: 'RSP-OXF-001-UK9-BRN' },
          ],
          specifications: [
            { key: 'Upper Material', value: '100% Full-Grain French Calfskin' },
            { key: 'Sole Construction', value: 'Goodyear Welted with Beveled Waist' },
            { key: 'Lining', value: 'Breathable Supple Cowhide' },
            { key: 'Insole', value: 'Orthopedic Cushion Arch Support' },
            { key: 'Closure', value: '5-Eyelet Blind Eyelet Lace-Up' },
          ],
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          rating: 4.9,
          numReviews: 14,
        },
        {
          name: 'Velocity Pro Carbon Running Shoes',
          slug: 'velocity-pro-carbon-running-shoes',
          sku: 'RSP-SPT-002',
          brand: 'AeroStride',
          category: categoryDocs['sports-shoes']?._id,
          subcategory: 'Running Shoes',
          description:
            'Engineered for maximum kinetic energy return. Featuring full-length aerospace carbon fiber plate, nitrogen-infused supercritical foam midsole, and ultra-breathable engineered mono-mesh upper.',
          shortDescription: 'Carbon plate kinetic propulsion with nitrogen-infused cushion.',
          regularPrice: 7999,
          salePrice: 6499,
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Crimson Red', colorCode: '#DC2626', stock: 6, sku: 'RSP-SPT-002-UK7-RED' },
            { size: 'UK 8', color: 'Crimson Red', colorCode: '#DC2626', stock: 15, sku: 'RSP-SPT-002-UK8-RED' },
            { size: 'UK 9', color: 'Crimson Red', colorCode: '#DC2626', stock: 10, sku: 'RSP-SPT-002-UK9-RED' },
            { size: 'UK 8', color: 'Jet Black', colorCode: '#151515', stock: 8, sku: 'RSP-SPT-002-UK8-BLK' },
            { size: 'UK 9', color: 'Jet Black', colorCode: '#151515', stock: 5, sku: 'RSP-SPT-002-UK9-BLK' },
          ],
          specifications: [
            { key: 'Upper Material', value: 'Lightweight Engineered Mono-Mesh' },
            { key: 'Midsole', value: 'Nitrogen Supercritical Foam with 3K Carbon Plate' },
            { key: 'Outsole', value: 'High-Traction Blown Rubber Lug' },
            { key: 'Drop', value: '8mm' },
            { key: 'Weight', value: '215 grams (UK 8)' },
          ],
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          rating: 4.8,
          numReviews: 22,
        },
        {
          name: 'Milano Suede Penny Loafers',
          slug: 'milano-suede-penny-loafers',
          sku: 'RSP-CAS-003',
          brand: 'Raza Sartorial',
          category: categoryDocs['casual-shoes']?._id,
          subcategory: 'Loafers',
          description:
            'Handcrafted in Tuscany from butter-soft waterproof suede. The quintessential gentleman slip-on designed for relaxed tailoring, driving, and yachting.',
          shortDescription: 'Tuscan water-repellent suede with unlined summer lightness.',
          regularPrice: 5499,
          salePrice: null,
          images: [
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Sand Tan', colorCode: '#D2B48C', stock: 4, sku: 'RSP-CAS-003-UK7-TAN' },
            { size: 'UK 8', color: 'Sand Tan', colorCode: '#D2B48C', stock: 9, sku: 'RSP-CAS-003-UK8-TAN' },
            { size: 'UK 9', color: 'Sand Tan', colorCode: '#D2B48C', stock: 7, sku: 'RSP-CAS-003-UK9-TAN' },
            { size: 'UK 10', color: 'Sand Tan', colorCode: '#D2B48C', stock: 2, sku: 'RSP-CAS-003-UK10-TAN' },
            { size: 'UK 8', color: 'Navy Blue', colorCode: '#1E3A8A', stock: 6, sku: 'RSP-CAS-003-UK8-NVY' },
          ],
          specifications: [
            { key: 'Upper Material', value: 'Hydrophobic Italian Velvet Suede' },
            { key: 'Insole', value: 'Padded Calfskin Insole' },
            { key: 'Sole', value: 'Flexible Nubbed Driving Rubber' },
            { key: 'Fit', value: 'Standard Width (Medium D)' },
          ],
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          rating: 4.7,
          numReviews: 9,
        },
        {
          name: 'Apex Court Low-Top Sneaker',
          slug: 'apex-court-low-top-sneaker',
          sku: 'RSP-SNK-004',
          brand: 'Urban Monarch',
          category: categoryDocs['sneakers']?._id,
          subcategory: 'Low Tops',
          description:
            'A minimalist luxury court silhouette constructed from smooth Nappa leather with subtle champagne gold foil branding and durable Margom-style cupsole.',
          shortDescription: 'Italian Nappa leather minimalist court sneaker.',
          regularPrice: 4999,
          salePrice: 3999,
          images: [
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Pure White', colorCode: '#FFFFFF', stock: 10, sku: 'RSP-SNK-004-UK7-WHT' },
            { size: 'UK 8', color: 'Pure White', colorCode: '#FFFFFF', stock: 18, sku: 'RSP-SNK-004-UK8-WHT' },
            { size: 'UK 9', color: 'Pure White', colorCode: '#FFFFFF', stock: 14, sku: 'RSP-SNK-004-UK9-WHT' },
            { size: 'UK 10', color: 'Pure White', colorCode: '#FFFFFF', stock: 7, sku: 'RSP-SNK-004-UK10-WHT' },
            { size: 'UK 8', color: 'Champagne Accent', colorCode: '#D6B878', stock: 8, sku: 'RSP-SNK-004-UK8-GLD' },
          ],
          specifications: [
            { key: 'Upper Material', value: 'Top-Grain Italian Nappa Leather' },
            { key: 'Sole', value: 'Stitched Anti-Slip Rubber Cupsole' },
            { key: 'Lining', value: 'Breathable Antibacterial Leather' },
            { key: 'Laces', value: '100% Waxed Organic Cotton' },
          ],
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          rating: 5.0,
          numReviews: 18,
        },
        {
          name: 'Amalfi Leather Slide Sandals',
          slug: 'amalfi-leather-slide-sandals',
          sku: 'RSP-SND-005',
          brand: 'Raza Resort',
          category: categoryDocs['sandals-slippers']?._id,
          subcategory: 'Leather Sandals',
          description:
            'Double-strap slides crafted from supple vegetable-tanned leather, equipped with brushed brass buckles and an anatomically contoured natural cork footbed.',
          shortDescription: 'Vegetable-tanned leather with natural contoured cork footbed.',
          regularPrice: 2999,
          salePrice: 2299,
          images: [
            'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Dark Oak', colorCode: '#4A2C11', stock: 6, sku: 'RSP-SND-005-UK7-OAK' },
            { size: 'UK 8', color: 'Dark Oak', colorCode: '#4A2C11', stock: 12, sku: 'RSP-SND-005-UK8-OAK' },
            { size: 'UK 9', color: 'Dark Oak', colorCode: '#4A2C11', stock: 9, sku: 'RSP-SND-005-UK9-OAK' },
            { size: 'UK 10', color: 'Dark Oak', colorCode: '#4A2C11', stock: 4, sku: 'RSP-SND-005-UK10-OAK' },
          ],
          specifications: [
            { key: 'Strap Material', value: 'Vegetable-Tanned Full-Grain Cowhide' },
            { key: 'Footbed', value: 'Natural Cork & Latex with Suede Sock' },
            { key: 'Buckles', value: 'Solid Brass Corrosion-Resistant' },
            { key: 'Outsole', value: 'Lightweight EVA Shock Absorbent' },
          ],
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: true,
          rating: 4.6,
          numReviews: 8,
        },
        {
          name: 'The Royal Chelsea Boot',
          slug: 'the-royal-chelsea-boot',
          sku: 'RSP-MEN-006',
          brand: 'Raza Heritage',
          category: categoryDocs['mens-shoes']?._id,
          subcategory: 'Boots',
          description:
            'A legendary silhouette tailored with single-cut leather, elasticized side gussets, dual pull tabs, and Dainite studded rubber sole for all-weather grip.',
          shortDescription: 'Single-piece leather upper with Dainite studded rubber sole.',
          regularPrice: 8499,
          salePrice: 6999,
          images: [
            'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',
          ],
          variants: [
            { size: 'UK 7', color: 'Vintage Walnut', colorCode: '#5C381E', stock: 3, sku: 'RSP-MEN-006-UK7-WAL' },
            { size: 'UK 8', color: 'Vintage Walnut', colorCode: '#5C381E', stock: 7, sku: 'RSP-MEN-006-UK8-WAL' },
            { size: 'UK 9', color: 'Vintage Walnut', colorCode: '#5C381E', stock: 6, sku: 'RSP-MEN-006-UK9-WAL' },
            { size: 'UK 10', color: 'Vintage Walnut', colorCode: '#5C381E', stock: 2, sku: 'RSP-MEN-006-UK10-WAL' },
            { size: 'UK 8', color: 'Onyx Black', colorCode: '#151515', stock: 5, sku: 'RSP-MEN-006-UK8-BLK' },
          ],
          specifications: [
            { key: 'Upper Material', value: 'Aniline Waxed Calfskin' },
            { key: 'Sole', value: 'Dainite Studded Rubber Goodyear Welted' },
            { key: 'Gusset', value: 'Reinforced Heavy-Gauge Elastic' },
            { key: 'Shaft Height', value: '14.5 cm' },
          ],
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          rating: 4.9,
          numReviews: 12,
        },
      ];

      for (const prod of sampleProducts) {
        await Product.create(prod);
        console.log(`[Seed] Created product: ${prod.name}`);
      }
    } else {
      console.log(`[Seed] Found ${productCount} existing products in database.`);
    }

    console.log('[Seed] Seeding completed successfully! All database systems ready.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seed();
