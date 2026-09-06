import React from 'react';
import { Check } from 'lucide-react';

export default function ColorSwatchPicker({ colors, selectedColor, onSelectColor }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Garment Color: <strong className="text-slate-900 capitalize">{selectedColor?.colorName || 'Default'}</strong>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id || selectedColor?.colorName === color.colorName;
          const hex = (color.hexCode || '').toLowerCase();
          const isLight = hex === '#ffffff' || hex === '#fff';

          return (
            <button
              key={color.id || color.colorName}
              type="button"
              onClick={() => onSelectColor(color)}
              title={color.colorName}
              style={{ backgroundColor: color.hexCode }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 relative shadow-2xs
                ${isLight ? 'border border-slate-300' : 'border border-transparent'}
                ${isSelected 
                  ? 'ring-2 ring-orange-500 ring-offset-2 scale-110 shadow-md' 
                  : 'hover:scale-105 hover:opacity-90'}
              `}
            >
              {isSelected && (
                <Check className={`w-4 h-4 stroke-[3] ${isLight ? 'text-slate-900' : 'text-white'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
