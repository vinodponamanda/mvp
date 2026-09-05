import React from 'react';
import { Shirt, Sparkles, Check } from 'lucide-react';

export default function PlacementSideBar({
  printAreas,
  activeSide,
  onSelectSide,
  customizedSides = {}
}) {
  if (!printAreas || printAreas.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">
        Placement Side:
      </span>
      
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {printAreas.map((area) => {
          const isActive = area.positionName === activeSide;
          const isCustomized = Boolean(customizedSides[area.positionName]);

          return (
            <button
              key={area.positionName}
              type="button"
              onClick={() => onSelectSide(area.positionName)}
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150
                ${isActive 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25' 
                  : 'bg-slate-50 hover:bg-orange-50 text-slate-700 border border-slate-200'}
              `}
            >
              <span>{area.positionName}</span>

              {area.extraCost > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  +₹{area.extraCost}
                </span>
              )}

              {isCustomized && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Artwork Placed" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
