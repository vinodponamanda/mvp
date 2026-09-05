import React, { useState } from 'react';
import { Plus, Trash2, Sliders, CheckSquare, Square } from 'lucide-react';
import BoundingBoxDrawer from './BoundingBoxDrawer';

const PRINT_METHODS = ['DTF', 'Screen Printing', 'Sublimation', 'Embroidery'];
const COMMON_POSITIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Mug Wrap', 'Hood'];

// Standard canvas reference: 20" wide x 24" high
const CANVAS_REF_WIDTH_INCHES = 20.0;
const CANVAS_REF_HEIGHT_INCHES = 24.0;

export default function PrintZonesTab({ printAreas, colors, onChange }) {
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  const addPrintZone = () => {
    const existing = printAreas.map(p => p.positionName);
    const nextPos = COMMON_POSITIONS.find(p => !existing.includes(p)) || 'Front';

    const defaultWidth = nextPos === 'Mug Wrap' ? 8.5 : 10.0;
    const defaultHeight = nextPos === 'Mug Wrap' ? 3.5 : 12.0;

    const boxW = Math.min(90, Math.max(10, Math.round((defaultWidth / CANVAS_REF_WIDTH_INCHES) * 100 * 10) / 10));
    const boxH = Math.min(90, Math.max(10, Math.round((defaultHeight / CANVAS_REF_HEIGHT_INCHES) * 100 * 10) / 10));
    const boxX = Math.round(((100 - boxW) / 2) * 10) / 10;
    const boxY = Math.round(((100 - boxH) / 2) * 10) / 10;

    const newZone = {
      positionName: nextPos,
      boxXPercent: boxX,
      boxYPercent: boxY,
      boxWidthPercent: boxW,
      boxHeightPercent: boxH,
      physicalWidthInches: defaultWidth,
      physicalHeightInches: defaultHeight,
      extraCost: printAreas.length === 0 ? 0 : 100,
      supportedPrintMethods: ['DTF', 'Screen Printing']
    };

    const updated = [...printAreas, newZone];
    onChange(updated);
    setSelectedZoneIndex(updated.length - 1);
  };

  const updateZone = (index, field, value) => {
    const updated = [...printAreas];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Bidirectional sync when admin changes physical Width (Inches)
  const handleWidthInchesChange = (index, rawValue) => {
    const safeWidth = Math.max(0.1, parseFloat(rawValue) || 0.1);
    const updated = [...printAreas];
    const zone = updated[index];

    // Calculate new width %
    const newBoxW = Math.min(95, Math.max(5, Math.round((safeWidth / CANVAS_REF_WIDTH_INCHES) * 100 * 10) / 10));
    // Keep X within bounds
    const newBoxX = Math.min(zone.boxXPercent, 100 - newBoxW);

    updated[index] = {
      ...zone,
      physicalWidthInches: safeWidth,
      boxWidthPercent: newBoxW,
      boxXPercent: Math.max(0, newBoxX)
    };
    onChange(updated);
  };

  // Bidirectional sync when admin changes physical Height (Inches)
  const handleHeightInchesChange = (index, rawValue) => {
    const safeHeight = Math.max(0.1, parseFloat(rawValue) || 0.1);
    const updated = [...printAreas];
    const zone = updated[index];

    // Calculate new height %
    const newBoxH = Math.min(95, Math.max(5, Math.round((safeHeight / CANVAS_REF_HEIGHT_INCHES) * 100 * 10) / 10));
    // Keep Y within bounds
    const newBoxY = Math.min(zone.boxYPercent, 100 - newBoxH);

    updated[index] = {
      ...zone,
      physicalHeightInches: safeHeight,
      boxHeightPercent: newBoxH,
      boxYPercent: Math.max(0, newBoxY)
    };
    onChange(updated);
  };

  // Bidirectional sync when dragging / resizing the visual bounding box
  const updateCoordinates = (index, coords) => {
    const updated = [...printAreas];
    const current = updated[index];

    // Calculate physical inches from new percentages
    const derivedWidthInches = Math.round((coords.boxWidthPercent / 100) * CANVAS_REF_WIDTH_INCHES * 10) / 10;
    const derivedHeightInches = Math.round((coords.boxHeightPercent / 100) * CANVAS_REF_HEIGHT_INCHES * 10) / 10;

    updated[index] = {
      ...current,
      ...coords,
      physicalWidthInches: derivedWidthInches,
      physicalHeightInches: derivedHeightInches
    };
    onChange(updated);
  };

  const togglePrintMethod = (zoneIndex, method) => {
    const updated = [...printAreas];
    const currentMethods = updated[zoneIndex].supportedPrintMethods || [];
    if (currentMethods.includes(method)) {
      if (currentMethods.length > 1) {
        updated[zoneIndex].supportedPrintMethods = currentMethods.filter(m => m !== method);
      }
    } else {
      updated[zoneIndex].supportedPrintMethods = [...currentMethods, method];
    }
    onChange(updated);
  };

  const removeZone = (index) => {
    const updated = printAreas.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedZoneIndex >= updated.length) {
      setSelectedZoneIndex(Math.max(0, updated.length - 1));
    }
  };

  const currentZone = printAreas[selectedZoneIndex] || null;

  const findMockupUrl = () => {
    if (!currentZone) return '';
    for (const color of colors) {
      const match = color.mockups?.find(m => m.position === currentZone.positionName && m.mockupUrl);
      if (match) return match.mockupUrl;
    }
    for (const color of colors) {
      if (color.mockups?.length > 0 && color.mockups[0].mockupUrl) {
        return color.mockups[0].mockupUrl;
      }
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Printable Zones & Bounding Box Studio</h3>
          <p className="text-xs text-slate-500 font-medium">
            Define printable boundaries ($X\%, Y\%, W\%, H\%$), physical print sizes, allowed print methods & extra side surcharges
          </p>
        </div>
        <button
          type="button"
          onClick={addPrintZone}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Printable Zone
        </button>
      </div>

      {printAreas.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <p className="text-sm font-semibold">No print zones defined yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "+ Add Printable Zone" (e.g. Front, Back, Mug Wrap) so customers can place graphics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Zone Selector Column (Left) */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Configured Zones</p>
            <div className="space-y-2">
              {printAreas.map((zone, idx) => {
                const isSelected = idx === selectedZoneIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedZoneIndex(idx)}
                    className={`
                      p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                      ${isSelected 
                        ? 'bg-orange-50/80 border-orange-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{zone.positionName}</span>
                        {zone.extraCost > 0 ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                            +₹{zone.extraCost}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Included
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {zone.physicalWidthInches}" × {zone.physicalHeightInches}" • {zone.supportedPrintMethods?.join(', ') || 'DTF'}
                      </p>
                    </div>

                    {printAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeZone(idx);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Zone Fine Details Form */}
            {currentZone && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Zone Settings: {currentZone.positionName}
                </h4>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Zone Position Name *</label>
                  <select
                    value={currentZone.positionName}
                    onChange={(e) => updateZone(selectedZoneIndex, 'positionName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                  >
                    {COMMON_POSITIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Width (Inches) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="10.0"
                      value={currentZone.physicalWidthInches}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }}
                      onChange={(e) => handleWidthInchesChange(selectedZoneIndex, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Height (Inches) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="12.0"
                      value={currentZone.physicalHeightInches}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }}
                      onChange={(e) => handleHeightInchesChange(selectedZoneIndex, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Extra Side Surcharge (+₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    value={currentZone.extraCost}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }}
                    onChange={(e) => updateZone(selectedZoneIndex, 'extraCost', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-orange-600 focus:outline-none focus:border-orange-500 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">e.g. ₹0 for front, +₹120 if customer adds back print</p>
                </div>

                {/* Allowed Print Methods Checkboxes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-2">Supported Print Methods *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRINT_METHODS.map((method) => {
                      const isChecked = currentZone.supportedPrintMethods?.includes(method);
                      return (
                        <div
                          key={method}
                          onClick={() => togglePrintMethod(selectedZoneIndex, method)}
                          className={`
                            px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all
                            ${isChecked 
                              ? 'bg-orange-50 text-orange-800 border-orange-300 shadow-xs' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}
                          `}
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4 text-orange-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                          <span>{method}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Bounding Box Drawer Column (Right) */}
          <div className="lg:col-span-8">
            {currentZone && (
              <BoundingBoxDrawer
                mockupUrl={findMockupUrl()}
                positionName={currentZone.positionName}
                boxXPercent={currentZone.boxXPercent}
                boxYPercent={currentZone.boxYPercent}
                boxWidthPercent={currentZone.boxWidthPercent}
                boxHeightPercent={currentZone.boxHeightPercent}
                physicalWidthInches={currentZone.physicalWidthInches}
                physicalHeightInches={currentZone.physicalHeightInches}
                onChange={(coords) => updateCoordinates(selectedZoneIndex, coords)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
