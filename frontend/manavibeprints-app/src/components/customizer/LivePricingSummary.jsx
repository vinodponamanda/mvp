import React from 'react';
import { Minus, Plus, Sparkles, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function LivePricingSummary({
  basePrice,
  volumeTiers = [],
  quantity,
  onQuantityChange,
  materialAdjustment = 0,
  sizeAdjustment = 0,
  extraSidesCost = 0,
  onAddToCart,
  addingToCart = false
}) {
  // Find active volume tier
  let activeTier = null;
  let unitBasePrice = basePrice;
  let discountPercentage = 0;

  if (volumeTiers && volumeTiers.length > 0) {
    activeTier = volumeTiers.find(
      (t) => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
    );
    if (activeTier) {
      unitBasePrice = activeTier.unitPrice;
      discountPercentage = activeTier.discountPercentage;
    }
  }

  // Calculate final single-piece unit price
  const finalUnitPrice = unitBasePrice + materialAdjustment + sizeAdjustment + extraSidesCost;
  const totalPrice = finalUnitPrice * quantity;

  // Next tier incentive
  const nextTier = volumeTiers?.find((t) => t.minQuantity > quantity);

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4">
      {/* Quantity Incrementer & Fast Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Order Quantity
          </label>
          {discountPercentage > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {discountPercentage}% Bulk Tier Discount Applied!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-300 rounded-2xl bg-white shadow-xs p-1">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 text-center text-sm font-black text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[1, 5, 15, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onQuantityChange(preset)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  quantity === preset
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-orange-50 text-slate-600'
                }`}
              >
                {preset} pcs
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Tier Motivation Banner */}
        {nextTier && (
          <p className="text-[11px] text-orange-800 bg-orange-50 p-2 rounded-xl border border-orange-200 font-medium">
            💡 Add <strong>{nextTier.minQuantity - quantity} more pcs</strong> to unlock bulk pricing at <strong>₹{nextTier.unitPrice}/pc</strong> ({nextTier.discountPercentage}% off)!
          </p>
        )}
      </div>

      {/* Itemized Price Breakdown */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Base Unit Price</span>
          <span className="font-semibold">₹{unitBasePrice}</span>
        </div>

        {materialAdjustment > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Fabric Upgrade</span>
            <span className="font-semibold">+₹{materialAdjustment}</span>
          </div>
        )}

        {sizeAdjustment > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Size Surcharge</span>
            <span className="font-semibold">+₹{sizeAdjustment}</span>
          </div>
        )}

        {extraSidesCost > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Extra Print Sides</span>
            <span className="font-semibold">+₹{extraSidesCost}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
          <div>
            <span className="text-sm font-black text-slate-900">Total Amount</span>
            <span className="text-[11px] text-slate-500 block font-medium">
              (₹{finalUnitPrice} / piece × {quantity} pcs)
            </span>
          </div>
          <span className="text-2xl font-black text-orange-600 font-['Outfit']">
            ₹{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add to Cart CTA Button */}
      <button
        type="button"
        onClick={onAddToCart}
        disabled={addingToCart}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Add Customized Items to Cart</span>
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>100% Quality Inspected • Free Replacement on Print Flaws</span>
      </div>
    </div>
  );
}
