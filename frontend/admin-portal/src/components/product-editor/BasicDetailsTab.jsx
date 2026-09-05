import React from 'react';

export default function BasicDetailsTab({ product, categories, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Classic Round Neck T-Shirt"
            value={product.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            value={product.categoryId}
            onChange={(e) => onChange('categoryId', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Base SKU */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Base SKU
          </label>
          <input
            type="text"
            placeholder="e.g. MVP-TSHIRT-001"
            value={product.baseSku}
            onChange={(e) => onChange('baseSku', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          />
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Base Retail Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 499"
            value={product.basePrice}
            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            onChange={(e) => {
              const val = e.target.value;
              onChange('basePrice', val === '' ? '' : Math.max(0, parseFloat(val) || 0));
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-black text-orange-600 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          />
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Starting single-piece price before volume discounts</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Product Description & Specs
        </label>
        <textarea
          rows={3}
          placeholder="Describe fabric blend, GSM, wash care recommendations, print durability..."
          value={product.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={product.isCustomizable}
            onChange={(e) => onChange('isCustomizable', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500"
          />
          <div>
            <span className="text-sm font-bold text-slate-900">Customizable in 2D Designer</span>
            <p className="text-xs text-slate-500">Allows customer to upload graphics and customize online</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={(e) => onChange('isActive', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500"
          />
          <div>
            <span className="text-sm font-bold text-slate-900">Published / Active</span>
            <p className="text-xs text-slate-500">Product is visible to buyers in the storefront</p>
          </div>
        </label>
      </div>
    </div>
  );
}
