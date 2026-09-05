import React from 'react';
import { Layers, Tag } from 'lucide-react';

export default function MaterialSizeSelector({
  materials,
  selectedMaterial,
  onSelectMaterial,
  sizes,
  selectedSize,
  onSelectSize
}) {
  return (
    <div className="space-y-4">
      {/* Fabric / Material GSM Selection */}
      {materials && materials.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-orange-600" /> Fabric Weight & GSM
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {materials.map((mat) => {
              const isSelected = selectedMaterial?.id === mat.id || selectedMaterial?.materialName === mat.materialName;
              return (
                <div
                  key={mat.id || mat.materialName}
                  onClick={() => onSelectMaterial(mat)}
                  className={`
                    p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-xs ring-1 ring-orange-400' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}
                  `}
                >
                  <div>
                    <p className="font-bold truncate">{mat.materialName}</p>
                    {mat.gsmValue && (
                      <p className="text-[10px] text-slate-500 font-medium">{mat.gsmValue} GSM</p>
                    )}
                  </div>

                  {mat.priceAdjustment > 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-black">
                      +₹{mat.priceAdjustment}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold">Standard</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Garment Size Selection */}
      {sizes && sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-orange-600" /> Select Size
          </label>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize?.id === size.id || selectedSize?.sizeLabel === size.sizeLabel;
              return (
                <button
                  key={size.id || size.sizeLabel}
                  type="button"
                  onClick={() => onSelectSize(size)}
                  className={`
                    px-3.5 py-2 rounded-xl text-xs font-bold transition-all
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'}
                  `}
                >
                  <span>{size.sizeLabel}</span>
                  {size.priceAdjustment > 0 && (
                    <span className="ml-1 text-[10px] opacity-75 font-normal">
                      (+₹{size.priceAdjustment})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
