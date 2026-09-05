import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';

const AVAILABLE_POSITIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Mug Wrap', 'Hood'];

export default function ColorsMockupsTab({ colors, onChange }) {
  const addColor = () => {
    onChange([
      ...colors,
      {
        colorName: 'Jet Black',
        hexCode: '#111111',
        displayOrder: colors.length + 1,
        mockups: [
          { position: 'Front', mockupUrl: '', displayOrder: 1 }
        ]
      }
    ]);
  };

  const updateColor = (index, field, value) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeColor = (index) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const addMockupToColor = (colorIndex) => {
    const updated = [...colors];
    const existingPositions = updated[colorIndex].mockups.map(m => m.position);
    const nextPos = AVAILABLE_POSITIONS.find(p => !existingPositions.includes(p)) || 'Front';

    updated[colorIndex].mockups.push({
      position: nextPos,
      mockupUrl: '',
      displayOrder: updated[colorIndex].mockups.length + 1
    });
    onChange(updated);
  };

  const updateMockup = (colorIndex, mockupIndex, field, value) => {
    const updated = [...colors];
    updated[colorIndex].mockups[mockupIndex] = {
      ...updated[colorIndex].mockups[mockupIndex],
      [field]: value
    };
    onChange(updated);
  };

  const removeMockup = (colorIndex, mockupIndex) => {
    const updated = [...colors];
    updated[colorIndex].mockups = updated[colorIndex].mockups.filter((_, i) => i !== mockupIndex);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Colors & Blank Mockup Photos</h3>
          <p className="text-xs text-slate-500 font-medium">Pick color hex codes and upload blank product photos for each placement side</p>
        </div>
        <button
          type="button"
          onClick={addColor}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Color
        </button>
      </div>

      {colors.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <p className="text-sm font-semibold">No product colors added</p>
          <p className="text-xs text-slate-400 mt-1">Add at least one color (e.g. Classic White, Black) and its blank mockup image</p>
        </div>
      ) : (
        <div className="space-y-6">
          {colors.map((color, cIdx) => (
            <div key={cIdx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              {/* Color Header & Hex Picker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="color"
                      value={color.hexCode}
                      onChange={(e) => updateColor(cIdx, 'hexCode', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-xs"
                    />
                  </div>

                  <div className="flex-1 sm:w-48">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">Color Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Classic White"
                      value={color.colorName}
                      onChange={(e) => updateColor(cIdx, 'colorName', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">Hex Code</label>
                    <input
                      type="text"
                      value={color.hexCode}
                      onChange={(e) => updateColor(cIdx, 'hexCode', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 font-mono font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addMockupToColor(cIdx)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-600" /> Add Position Side
                  </button>

                  <button
                    type="button"
                    onClick={() => removeColor(cIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mockup Placements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {color.mockups.map((mockup, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Side Position:</span>
                        <select
                          value={mockup.position}
                          onChange={(e) => updateMockup(cIdx, mIdx, 'position', e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                        >
                          {AVAILABLE_POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>

                      {color.mockups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMockup(cIdx, mIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Remove Side"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <ImageUploader
                      value={mockup.mockupUrl}
                      onChange={(url) => updateMockup(cIdx, mIdx, 'mockupUrl', url)}
                      folder="mockups"
                      label={`Blank Mockup Photo (${mockup.position})`}
                      recommendedText="High-res clean product photo on plain background"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
