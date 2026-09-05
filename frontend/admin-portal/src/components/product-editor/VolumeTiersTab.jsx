import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function VolumeTiersTab({ volumeTiers, basePrice, onChange }) {
  const addTier = () => {
    const lastTier = volumeTiers[volumeTiers.length - 1];
    const nextMin = lastTier ? (lastTier.maxQuantity ? lastTier.maxQuantity + 1 : lastTier.minQuantity + 10) : 1;
    const defaultPrice = basePrice > 0 ? Math.round(basePrice * 0.8) : 0;

    onChange([
      ...volumeTiers,
      {
        minQuantity: nextMin,
        maxQuantity: nextMin + 15,
        unitPrice: defaultPrice,
        discountPercentage: 20
      }
    ]);
  };

  const updateTier = (index, field, value) => {
    const updated = [...volumeTiers];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'unitPrice' && basePrice > 0) {
      const disc = Math.max(0, Math.round(((basePrice - value) / basePrice) * 100 * 10) / 10);
      updated[index].discountPercentage = disc;
    }
    if (field === 'discountPercentage' && basePrice > 0) {
      const price = Math.max(0, Math.round(basePrice * (1 - (value / 100))));
      updated[index].unitPrice = price;
    }

    onChange(updated);
  };

  const removeTier = (index) => {
    onChange(volumeTiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Volume & Bulk Discount Matrix</h3>
          <p className="text-xs text-slate-500 font-medium">
            Set tiered unit prices for corporate bulk orders {basePrice > 0 && <>(Base Retail Price: <strong className="text-orange-600 font-black">₹{basePrice}</strong>)</>}
          </p>
        </div>
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Bulk Tier
        </button>
      </div>

      {volumeTiers.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <p className="text-sm font-semibold">No volume discount tiers defined</p>
          <p className="text-xs text-slate-400 mt-1">Single piece retail price will apply to all order quantities. Click "+ Add Bulk Tier" if you want quantity-based pricing (e.g. 10+ pcs, 50+ pcs).</p>
        </div>
      ) : (
        <div className="space-y-3">
          {volumeTiers.map((tier, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Min Qty *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={tier.minQuantity}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onChange={(e) => updateTier(idx, 'minQuantity', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Max Qty (Empty = Unlimited)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 20"
                    value={tier.maxQuantity ?? ''}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onChange={(e) => updateTier(idx, 'maxQuantity', e.target.value === '' ? null : Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Discounted Unit Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="399"
                    value={tier.unitPrice}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onChange={(e) => updateTier(idx, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-orange-600 font-black focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Discount %</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="20"
                      value={tier.discountPercentage}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      onChange={(e) => updateTier(idx, 'discountPercentage', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-emerald-700 font-black focus:outline-none focus:border-orange-500 pr-6 shadow-xs"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  {tier.maxQuantity ? `${tier.minQuantity}–${tier.maxQuantity} pcs` : `${tier.minQuantity}+ pcs`}
                </span>

                <button
                  type="button"
                  onClick={() => removeTier(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
