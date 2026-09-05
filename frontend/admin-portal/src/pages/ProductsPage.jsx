import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Shirt, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchCatalog = async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.baseSku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Customizable Blank Products</h2>
          <p className="text-xs text-slate-500 font-medium">Configure printable blank garments, mug templates, print bounding boxes & pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCatalog(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
            <span>Refresh List</span>
          </button>
          <Link
            to="/products/new"
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Customizable Blank
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by blank name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Shirt className="w-12 h-12 mx-auto opacity-30 text-orange-400" />
            <p className="text-sm font-bold text-slate-700">No customizable blanks found</p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create Blank Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50">
                <tr>
                  <th className="py-3.5 px-4">Blank Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Matrix Specs</th>
                  <th className="py-3.5 px-4">Print Zones</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const firstMockup = p.colors?.[0]?.mockups?.[0]?.mockupUrl;
                  return (
                    <tr key={p.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {firstMockup ? (
                            <img
                              src={firstMockup}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Shirt className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link 
                              to={`/products/edit/${p.id}`}
                              className="font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors block truncate"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] font-mono text-slate-500 font-medium">{p.baseSku || 'No SKU'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-bold text-[11px] border border-stone-200">
                          {p.categoryName || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-sm text-orange-600">
                        ₹{p.basePrice}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="space-y-0.5">
                          <p className="font-semibold">{p.colors?.length || 0} Colors • {p.sizes?.length || 0} Sizes</p>
                          <p className="text-[10px] text-slate-500 font-medium">{p.materials?.length || 0} Material/GSM variants</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.printAreas?.map((pa, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-orange-50 text-orange-800 font-bold text-[10px] border border-orange-200">
                              {pa.positionName}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.isActive} type="boolean" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/edit/${p.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title="Edit Matrix & Zones"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
}
