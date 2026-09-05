import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Eye } from 'lucide-react';

export default function BoundingBoxDrawer({
  mockupUrl,
  boxXPercent = 25,
  boxYPercent = 25,
  boxWidthPercent = 50,
  boxHeightPercent = 50,
  physicalWidthInches = 10,
  physicalHeightInches = 12,
  positionName = 'Front',
  onChange
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  const handleMouseDown = (e, handleType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setIsDragging(true);
    setActiveHandle(handleType);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      containerW: rect.width,
      containerH: rect.height,
      boxX: boxXPercent,
      boxY: boxYPercent,
      boxW: boxWidthPercent,
      boxH: boxHeightPercent,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !activeHandle) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const deltaPercentX = (deltaX / dragStart.containerW) * 100;
      const deltaPercentY = (deltaY / dragStart.containerH) * 100;

      let newX = dragStart.boxX;
      let newY = dragStart.boxY;
      let newW = dragStart.boxW;
      let newH = dragStart.boxH;

      if (activeHandle === 'move') {
        newX = Math.max(0, Math.min(100 - dragStart.boxW, dragStart.boxX + deltaPercentX));
        newY = Math.max(0, Math.min(100 - dragStart.boxH, dragStart.boxY + deltaPercentY));
      } else {
        if (activeHandle.includes('e')) {
          newW = Math.max(10, Math.min(100 - dragStart.boxX, dragStart.boxW + deltaPercentX));
        }
        if (activeHandle.includes('s')) {
          newH = Math.max(10, Math.min(100 - dragStart.boxY, dragStart.boxH + deltaPercentY));
        }
        if (activeHandle.includes('w')) {
          const maxLeftShift = dragStart.boxX + dragStart.boxW - 10;
          const clampedDeltaX = Math.min(maxLeftShift, Math.max(-dragStart.boxX, deltaPercentX));
          newX = dragStart.boxX + clampedDeltaX;
          newW = dragStart.boxW - clampedDeltaX;
        }
        if (activeHandle.includes('n')) {
          const maxTopShift = dragStart.boxY + dragStart.boxH - 10;
          const clampedDeltaY = Math.min(maxTopShift, Math.max(-dragStart.boxY, deltaPercentY));
          newY = dragStart.boxY + clampedDeltaY;
          newH = dragStart.boxH - clampedDeltaY;
        }
      }

      onChange({
        boxXPercent: Math.round(newX * 10) / 10,
        boxYPercent: Math.round(newY * 10) / 10,
        boxWidthPercent: Math.round(newW * 10) / 10,
        boxHeightPercent: Math.round(newH * 10) / 10,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeHandle, dragStart, onChange]);

  const handleCenter = () => {
    const newX = (100 - boxWidthPercent) / 2;
    const newY = (100 - boxHeightPercent) / 2;
    onChange({
      boxXPercent: Math.round(newX * 10) / 10,
      boxYPercent: Math.round(newY * 10) / 10,
      boxWidthPercent,
      boxHeightPercent,
    });
  };

  return (
    <div className="space-y-4">
      {/* Interactive Visual Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md select-none flex flex-col items-center">
        {/* Canvas Toolbar Top */}
        <div className="w-full px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white text-xs font-bold uppercase shadow-xs">
              {positionName} Zone
            </span>
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
              Drag box to position, drag corners to resize printable area
            </span>
          </div>
          <button
            type="button"
            onClick={handleCenter}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            Center Box
          </button>
        </div>

        {/* Visual Mockup Container */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-[480px] aspect-square bg-stone-100/70 flex items-center justify-center overflow-hidden border-y border-slate-100"
        >
          {mockupUrl ? (
            <img
              src={mockupUrl}
              alt="Blank Mockup"
              className="w-full h-full object-contain pointer-events-none p-2"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold text-slate-600">No Mockup Image Selected</p>
              <p className="text-xs text-slate-500 mt-1">Upload a blank mockup photo in Colors tab to visualize print boundaries</p>
            </div>
          )}

          {/* Interactive Printable Bounding Box */}
          <div
            style={{
              left: `${boxXPercent}%`,
              top: `${boxYPercent}%`,
              width: `${boxWidthPercent}%`,
              height: `${boxHeightPercent}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            className={`
              absolute border-2 border-dashed border-orange-500 bg-orange-500/20 backdrop-blur-[1px]
              cursor-move transition-shadow duration-150 z-10
              ${isDragging ? 'shadow-xl shadow-orange-500/40 border-orange-600 bg-orange-500/30' : 'hover:border-orange-600 hover:bg-orange-500/25'}
            `}
          >
            {/* Center Measurement Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-black text-[11px] shadow-md">
                {physicalWidthInches}" × {physicalHeightInches}" Area
              </span>
              <span className="text-[10px] text-slate-900 font-extrabold mt-0.5 drop-shadow-xs">
                {boxWidthPercent}% × {boxHeightPercent}%
              </span>
            </div>

            {/* Resize Handles (8 directions) */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-orange-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-orange-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-orange-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-orange-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform" 
            />

            {/* Edges */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'n')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white border border-orange-600 rounded-sm cursor-ns-resize shadow-xs" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white border border-orange-600 rounded-sm cursor-ns-resize shadow-xs" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'w')}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-5 bg-white border border-orange-600 rounded-sm cursor-ew-resize shadow-xs" 
            />
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'e')}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-5 bg-white border border-orange-600 rounded-sm cursor-ew-resize shadow-xs" 
            />
          </div>
        </div>

        {/* Live Coordinate Display */}
        <div className="w-full px-4 py-3 bg-slate-50 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">X Offset</span>
            <span className="text-orange-700 font-mono font-bold text-sm">{boxXPercent}%</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Y Offset</span>
            <span className="text-orange-700 font-mono font-bold text-sm">{boxYPercent}%</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Width</span>
            <span className="text-orange-700 font-mono font-bold text-sm">{boxWidthPercent}%</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Height</span>
            <span className="text-orange-700 font-mono font-bold text-sm">{boxHeightPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
