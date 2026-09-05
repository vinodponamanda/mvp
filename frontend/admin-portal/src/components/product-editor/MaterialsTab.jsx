import React from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function MaterialsTab({ materials, onChange }) {
  const addMaterial = () => {
    onChange([
      ...materials,
      {
        materialName: '180 GSM Bio-Washed Cotton',
        gsmValue: 180,
        priceAdjustment: 0,
        isDefault: materials.length === 0,
        displayOrder: materials.length + 1
      }
    ]);
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const setDefaultMaterial = (index) => {
    const updated = materials.map((m, i) => ({
      ...m,
      isDefault: i === index
    }));
    onChange(updated);
  };

  const removeMaterial = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(m => m.isDefault)) {
      updated[0].isDefault = true;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Fabric & Material Variants</h3>
          <p className="text-xs text-slate-500 font-medium">Configure GSM specs (e.g. 180 GSM Cotton, 240 GSM French Terry) with pricing adjustments</p>
        </div>
        <button
          type="button"
          onClick={addMaterial}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <p className="text-sm font-semibold">No material variants defined</p>
          <p className="text-xs text-slate-400 mt-1">Products like standard mugs or single-weight tees don't require multiple material rows</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((mat, idx) => (
            <div 
              key={idx}
              className={`
                p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                ${mat.isDefault ? 'bg-orange-50/50 border-orange-300 shadow-xs' : 'bg-white border-slate-200'}
              `}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Material Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. 180 GSM Bio-Washed Cotton"
                    value={mat.materialName}
                    onChange={(e) => updateMaterial(idx, 'materialName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">GSM Value</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={mat.gsmValue || ''}
                    onChange={(e) => updateMaterial(idx, 'gsmValue', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Price Extra (+₹)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={mat.priceAdjustment}
                    onChange={(e) => updateMaterial(idx, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-black text-orange-600 focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setDefaultMaterial(idx)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors
                    ${mat.isDefault 
                      ? 'bg-orange-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'}
                  `}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {mat.isDefault ? 'Default' : 'Set Default'}
                </button>

                <button
                  type="button"
                  onClick={() => removeMaterial(idx)}
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
