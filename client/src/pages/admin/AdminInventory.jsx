import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  ArrowRight,
} from 'lucide-react';
import API from '../../services/api';
import { formatCurrency } from '../../utils/format';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'low' | 'out'

  // Edited variant stock state: { [productId-variantId]: stockNumber }
  const [stockEdits, setStockEdits] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/admin/all');
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.warn('Could not load inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (productId, variantId, newStock) => {
    const key = `${productId}-${variantId}`;
    setStockEdits({
      ...stockEdits,
      [key]: Math.max(0, parseInt(newStock) || 0),
    });
  };

  const handleSaveStock = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    const newStock = stockEdits[key];
    if (newStock === undefined) return;

    setSavingKey(key);
    try {
      await API.patch(`/products/${productId}/variants/${variantId}/stock`, {
        stock: newStock,
      });

      // Update local state
      setProducts(
        products.map((p) => {
          if (p._id === productId) {
            const updatedVariants = p.variants.map((v) =>
              v._id === variantId ? { ...v, stock: newStock } : v
            );
            return { ...p, variants: updatedVariants };
          }
          return p;
        })
      );

      // Clear from pending edits
      const copy = { ...stockEdits };
      delete copy[key];
      setStockEdits(copy);
    } catch (err) {
      alert(err.message || 'Failed to update variant stock.');
    } finally {
      setSavingKey(null);
    }
  };

  // Flatten products into variant rows for granular inventory monitoring
  const variantRows = [];
  products.forEach((prod) => {
    prod.variants?.forEach((v) => {
      variantRows.push({
        productId: prod._id,
        productName: prod.name,
        brand: prod.brand,
        productSku: prod.sku,
        image: prod.images?.[0] || '',
        price: prod.salePrice || prod.regularPrice,
        variantId: v._id,
        size: v.size,
        color: v.color,
        colorCode: v.colorCode,
        stock: v.stock,
        variantSku: v.sku || `${prod.sku}-${v.size}-${v.color}`,
      });
    });
  });

  // Filter rows
  const filteredRows = variantRows.filter((row) => {
    const matchesSearch =
      searchTerm === '' ||
      row.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.variantSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.color.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterLevel === 'low') return row.stock > 0 && row.stock <= 5;
    if (filterLevel === 'out') return row.stock === 0;
    return true;
  });

  const lowStockCount = variantRows.filter((r) => r.stock > 0 && r.stock <= 5).length;
  const outOfStockCount = variantRows.filter((r) => r.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Variant Precision Inventory
        </span>
        <h1 className="font-serif text-2xl font-bold text-luxury-black">
          Variant Stock Management ({variantRows.length} Permutations)
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Individual size/color variant stock counters directly govern live cart checkout validation to prevent overselling.
        </p>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterLevel('all')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            filterLevel === 'all' ? 'border-luxury-black ring-1 ring-luxury-black' : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
            Total Monitored Variants
          </span>
          <span className="text-2xl font-bold font-sans text-luxury-black">{variantRows.length}</span>
        </div>

        <div
          onClick={() => setFilterLevel('low')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            filterLevel === 'low' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold block mb-1">
            Low Stock Alerts (≤ 5 units)
          </span>
          <span className="text-2xl font-bold font-sans text-amber-700">{lowStockCount}</span>
        </div>

        <div
          onClick={() => setFilterLevel('out')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            filterLevel === 'out' ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold block mb-1">
            Out of Stock (0 units)
          </span>
          <span className="text-2xl font-bold font-sans text-red-600">{outOfStockCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variant by shoe title, size, color, or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Filter Level:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="p-2 border border-gray-200 font-semibold focus:outline-none focus:border-luxury-gold"
          >
            <option value="all">All Variants ({variantRows.length})</option>
            <option value="low">Low Stock Only ({lowStockCount})</option>
            <option value="out">Out of Stock Only ({outOfStockCount})</option>
          </select>
        </div>
      </div>

      {/* Variant Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading variant inventory records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Footwear Model</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Variant SKU</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Adjust Inventory</th>
                  <th className="py-3 px-4 text-right">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((row) => {
                  const key = `${row.productId}-${row.variantId}`;
                  const isEdited = stockEdits[key] !== undefined;
                  const currentDisplayStock = isEdited ? stockEdits[key] : row.stock;
                  const isSaving = savingKey === key;

                  return (
                    <tr key={key} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img src={row.image} alt="" className="w-10 h-12 object-cover border border-gray-200 shrink-0" />
                          <div>
                            <span className="font-bold text-luxury-black block">{row.productName}</span>
                            <span className="text-[10px] text-gray-400">{row.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-luxury-black">
                        {row.size}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: row.colorCode || '#151515' }}
                          />
                          <span>{row.color}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {row.variantSku}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold font-sans ${
                            row.stock === 0
                              ? 'text-red-600'
                              : row.stock <= 5
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {row.stock} pairs
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleStockChange(row.productId, row.variantId, currentDisplayStock - 1)
                            }
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={currentDisplayStock}
                            onChange={(e) =>
                              handleStockChange(row.productId, row.variantId, e.target.value)
                            }
                            className={`w-16 p-1 border text-center font-bold font-sans ${
                              isEdited ? 'border-luxury-gold bg-amber-50' : 'border-gray-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleStockChange(row.productId, row.variantId, currentDisplayStock + 1)
                            }
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEdited && (
                          <button
                            type="button"
                            onClick={() => handleSaveStock(row.productId, row.variantId)}
                            disabled={isSaving}
                            className="px-3 py-1 bg-luxury-black text-white hover:bg-luxury-gold hover:text-luxury-black text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center space-x-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
