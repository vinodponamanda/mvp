import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Trash2, Layers } from 'lucide-react';

const FabricCanvasStage = forwardRef(function FabricCanvasStage(
  {
    mockupUrl,
    activeZone,
    onObjectSelected,
    onDpiCalculated
  },
  ref
) {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState(480);
  const [selectedObject, setSelectedObject] = useState(null);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    // Destroy existing canvas if any
    if (fabricRef.current) {
      fabricRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: canvasSize,
      height: canvasSize,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#f8fafc',
    });

    fabricRef.current = canvas;

    // Selection listeners
    canvas.on('selection:created', (e) => {
      const active = e.selected?.[0] || null;
      setSelectedObject(active);
      if (onObjectSelected) onObjectSelected(active);
    });

    canvas.on('selection:updated', (e) => {
      const active = e.selected?.[0] || null;
      setSelectedObject(active);
      if (onObjectSelected) onObjectSelected(active);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      if (onObjectSelected) onObjectSelected(null);
    });

    // Object modified (scale/move) - recalculate DPI if it's an image
    canvas.on('object:modified', (e) => {
      const target = e.target;
      if (target && target.type === 'image' && onDpiCalculated && activeZone) {
        const naturalWidth = target.getOriginalSize().width;
        const scaledWidthOnCanvas = target.getScaledWidth();
        const canvasZoneWidthPx = (activeZone.boxWidthPercent / 100) * canvasSize;
        const printWidthInches = activeZone.physicalWidthInches || 10;
        
        // Effective print width in inches occupied by this scaled graphic
        const effectiveInches = (scaledWidthOnCanvas / canvasZoneWidthPx) * printWidthInches;
        const dpi = Math.round(naturalWidth / Math.max(0.5, effectiveInches));
        onDpiCalculated(dpi);
      }
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasSize]);

  // Load Blank Mockup Photo as Background
  useEffect(() => {
    let isCurrent = true;
    if (!fabricRef.current || !mockupUrl) return;
    const canvas = fabricRef.current;

    fabric.Image.fromURL(
      mockupUrl,
      (img) => {
        if (!isCurrent || !fabricRef.current || !img) return;
        // Scale to fit canvas neatly
        img.scaleToWidth(canvasSize);
        img.set({
          left: (canvasSize - img.getScaledWidth()) / 2,
          top: (canvasSize - img.getScaledHeight()) / 2,
          selectable: false,
          evented: false,
        });

        try {
          if (fabricRef.current && canvas.getContext()) {
            canvas.setBackgroundImage(img, () => {
              if (isCurrent && fabricRef.current) {
                canvas.renderAll();
              }
            });
          }
        } catch (err) {
          console.warn('Canvas background image render skipped:', err);
        }
      },
      { crossOrigin: 'anonymous' }
    );

    return () => {
      isCurrent = false;
    };
  }, [mockupUrl, canvasSize]);

  // Expose Designer Actions to Parent Components
  useImperativeHandle(ref, () => ({
    // Add Uploaded Image Graphic
    addImage: (imageUrl, naturalWidth) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (!img) return;

          // Calculate boundary box pixel dimensions
          const boxW = ((activeZone?.boxWidthPercent || 50) / 100) * canvasSize;
          const boxH = ((activeZone?.boxHeightPercent || 50) / 100) * canvasSize;
          const boxX = ((activeZone?.boxXPercent || 25) / 100) * canvasSize;
          const boxY = ((activeZone?.boxYPercent || 25) / 100) * canvasSize;

          // Scale to fit within the bounding box
          img.scaleToWidth(boxW * 0.75);
          if (img.getScaledHeight() > boxH * 0.75) {
            img.scaleToHeight(boxH * 0.75);
          }

          // Center inside printable bounding box
          img.set({
            left: boxX + (boxW - img.getScaledWidth()) / 2,
            top: boxY + (boxH - img.getScaledHeight()) / 2,
            cornerColor: '#ea580c',
            cornerStrokeColor: '#ffffff',
            borderColor: '#ea580c',
            cornerSize: 10,
            transparentCorners: false,
          });

          // Clip to printable zone boundaries
          const clipRect = new fabric.Rect({
            left: boxX,
            top: boxY,
            width: boxW,
            height: boxH,
            absolutePositioned: true
          });
          // Remove any previous image objects so only ONE graphic is displayed
          const existingImages = canvas.getObjects().filter(obj => obj.type === 'image');
          existingImages.forEach(oldImg => canvas.remove(oldImg));

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          // Calculate initial DPI
          if (onDpiCalculated && activeZone) {
            const printWidthInches = activeZone.physicalWidthInches || 10;
            const effectiveInches = (img.getScaledWidth() / boxW) * printWidthInches;
            const dpi = Math.round((naturalWidth || img.width) / Math.max(0.5, effectiveInches));
            onDpiCalculated(dpi);
          }
        },
        { crossOrigin: 'anonymous' }
      );
    },

    // Add Text with Custom Google Fonts & Styling
    addText: (textString = 'YOUR DESIGN', options = {}) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const boxW = ((activeZone?.boxWidthPercent || 50) / 100) * canvasSize;
      const boxH = ((activeZone?.boxHeightPercent || 50) / 100) * canvasSize;
      const boxX = ((activeZone?.boxXPercent || 25) / 100) * canvasSize;
      const boxY = ((activeZone?.boxYPercent || 25) / 100) * canvasSize;

      const textObj = new fabric.IText(textString, {
        fontFamily: options.fontFamily || 'Outfit',
        fontSize: options.fontSize || 32,
        fill: options.fill || '#111111',
        fontWeight: options.fontWeight || 'bold',
        fontStyle: options.fontStyle || 'normal',
        textAlign: 'center',
        cornerColor: '#ea580c',
        cornerStrokeColor: '#ffffff',
        borderColor: '#ea580c',
        cornerSize: 10,
        transparentCorners: false,
      });

      // Position center of bounding box
      textObj.set({
        left: boxX + (boxW - textObj.width) / 2,
        top: boxY + (boxH - textObj.height) / 2,
      });

      // Clip path inside zone
      const clipRect = new fabric.Rect({
        left: boxX,
        top: boxY,
        width: boxW,
        height: boxH,
        absolutePositioned: true
      });
      textObj.clipPath = clipRect;

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
    },

    // Update Currently Selected Object Properties
    updateActiveObject: (property, value) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const active = canvas.getActiveObject();
      if (!active) return;

      active.set(property, value);
      canvas.renderAll();
    },

    // Delete Active Object
    deleteActiveObject: () => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const active = canvas.getActiveObject();
      if (active) {
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
        setSelectedObject(null);
      }
    },

    // Clear All Artwork
    clearCanvas: () => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const objects = canvas.getObjects();
      objects.forEach(obj => canvas.remove(obj));
      canvas.renderAll();
    },

    // Export Composite Proof Data URL (Mockup + Custom Design)
    exportCompositeProof: (options = {}) => {
      if (!fabricRef.current) return '';
      return fabricRef.current.toDataURL({
        format: options.format || 'png',
        quality: options.quality || 0.9,
        multiplier: options.multiplier || 1.5
      });
    },

    // Export Design JSON
    exportDesignJson: () => {
      if (!fabricRef.current) return null;
      return JSON.stringify(fabricRef.current.toJSON());
    },

    // Load Design JSON
    loadDesignJson: (jsonString) => {
      if (!fabricRef.current || !jsonString) return;
      fabricRef.current.loadFromJSON(jsonString, fabricRef.current.renderAll.bind(fabricRef.current));
    }
  }));

  // Calculate printable boundary box rectangle styling for UI visualization
  const boxLeft = activeZone ? `${activeZone.boxXPercent}%` : '25%';
  const boxTop = activeZone ? `${activeZone.boxYPercent}%` : '25%';
  const boxWidth = activeZone ? `${activeZone.boxWidthPercent}%` : '50%';
  const boxHeight = activeZone ? `${activeZone.boxHeightPercent}%` : '50%';

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Visual Canvas Container */}
      <div 
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200 select-none"
        style={{ width: canvasSize, height: canvasSize }}
      >
        {/* Fabric.js HTML5 Canvas */}
        <canvas ref={canvasElRef} width={canvasSize} height={canvasSize} />

        {/* Printable Boundary Box Overlay Guide (UI visual only, non-blocking) */}
        {activeZone && (
          <div
            style={{
              left: boxLeft,
              top: boxTop,
              width: boxWidth,
              height: boxHeight,
            }}
            className="absolute border-2 border-dashed border-orange-500/80 pointer-events-none z-10"
          >
            {/* Zone Tag outside the margin boundary */}
            <div className="absolute bottom-full left-0 mb-1.5 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-orange-200" />
              <span>{activeZone.positionName} Printable Zone ({activeZone.physicalWidthInches}" × {activeZone.physicalHeightInches}")</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Controls */}
      {selectedObject && (
        <div className="absolute bottom-6 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl z-20 animate-fadeIn">
          <span className="text-xs font-bold capitalize">
            {selectedObject.type === 'i-text' ? 'Text Layer' : 'Image Graphic'}
          </span>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => {
              if (fabricRef.current) {
                const active = fabricRef.current.getActiveObject();
                if (active) {
                  fabricRef.current.remove(active);
                  fabricRef.current.discardActiveObject();
                  fabricRef.current.renderAll();
                  setSelectedObject(null);
                }
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-bold text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      )}
    </div>
  );
});

export default FabricCanvasStage;
