import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, 
  Shirt, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  X, 
  SlidersHorizontal, 
  Layers, 
  Check,
  ArrowUpDown,
  ShieldCheck,
  TrendingDown,
  Flame,
  Coffee,
  Printer
} from 'lucide-react';
import api from '../api/client';

export default function CatalogPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [customizableOnly, setCustomizableOnly] = useState(false);

  useEffect(() => {
    setSelectedCategory(queryParams.get('category') || '');
  }, [location.search]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.baseSku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesCustom = !customizableOnly || p.isCustomizable;
    return matchesSearch && matchesCategory && matchesCustom;
  });

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchTerm ? 1 : 0) + (customizableOnly ? 1 : 0);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setCustomizableOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Header & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
            Printable Blanks & Merch Catalog
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            DTF Printing, Sublimation, T-Shirts, Formal Shirts, Ceramic Mugs, Caps & Keychains ready for 300 DPI custom printing
          </p>
        </div>

        {/* Search & Customizer Filter */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products, t-shirts, mugs, caps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2D Designer Filter Button */}
          <button
            type="button"
            onClick={() => setCustomizableOnly(!customizableOnly)}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs
              ${customizableOnly 
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20' 
                : 'bg-white text-slate-700 border border-slate-300 hover:border-orange-300 hover:text-orange-600'}
            `}
          >
            <Sparkles className={`w-3.5 h-3.5 ${customizableOnly ? 'text-amber-300' : 'text-orange-600'}`} />
            <span className="hidden sm:inline">2D Canvas Only</span>
            <span className="sm:hidden">2D</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          className={`
            px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs
            ${!selectedCategory 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
          `}
        >
          <Layers className="w-3.5 h-3.5 opacity-70" />
          <span>All Products</span>
        </button>

        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? '' : c.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs
                ${isSelected 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/40'}
              `}
            >
              <span>{c.name}</span>
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          );
        })}

        {/* Clear Filters Reset */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* 3. Product Catalog Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <Shirt className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No blank products match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or selecting another category to view available blanks.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {filteredProducts.map((product) => {
            const mockup = product.featuredImageUrl || product.colors?.[0]?.mockups?.[0]?.mockupUrl;

            return (
              <div
                key={product.id}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-orange-300 transition-all duration-200 flex flex-col group"
              >
                {/* Photo Mockup Stage */}
                <div className="relative aspect-square bg-stone-100/60 p-4 flex items-center justify-center overflow-hidden">
                  {mockup ? (
                    <img
                      src={mockup}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Shirt className="w-16 h-16 text-slate-300" />
                  )}

                  {product.isCustomizable && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-orange-700 border border-orange-200 shadow-2xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-600" /> 2D Studio
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {product.categoryName || 'Custom Merch'}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600">300 DPI Ready</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {product.colorHexCodes ? (
                        product.colorHexCodes.map((hex, idx) => (
                          <span
                            key={idx}
                            style={{ backgroundColor: hex }}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                          />
                        ))
                      ) : (
                        product.colors?.map((c, idx) => (
                          <span
                            key={idx}
                            style={{ backgroundColor: c.hexCode }}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            title={c.colorName}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">1 Pc Starting at</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-orange-600 font-['Outfit']">
                          ₹{product.basePrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ₹{Math.round(product.basePrice * 1.25)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={product.isCustomizable ? `/customize/${product.id}` : `/product/${product.id}`}
                      className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      {product.isCustomizable ? 'Customize' : 'Buy Now'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
