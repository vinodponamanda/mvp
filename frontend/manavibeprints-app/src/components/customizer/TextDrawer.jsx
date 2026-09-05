import React, { useState } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Plus } from 'lucide-react';

const GOOGLE_FONTS = [
  { name: 'Outfit (Modern)', family: 'Outfit' },
  { name: 'Inter (Clean)', family: 'Inter' },
  { name: 'Bebas Neue (Bold Impact)', family: 'Bebas Neue' },
  { name: 'Caveat (Handwritten)', family: 'Caveat' },
  { name: 'Pacifico (Retro Script)', family: 'Pacifico' },
  { name: 'Righteous (Urban Tech)', family: 'Righteous' },
  { name: 'Cinzel (Luxury Serif)', family: 'Cinzel' },
  { name: 'Satisfy (Calligraphy)', family: 'Satisfy' },
  { name: 'Press Start (8-Bit Pixel)', family: 'Press Start 2P' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#111111', '#DC2626', '#EA580C', '#F59E0B', 
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', 
  '#EC4899', '#78716C'
];

export default function TextDrawer({ onAddText, onUpdateActiveObject, activeObject }) {
  const [textContent, setTextContent] = useState('CUSTOM VIBE');
  const [selectedFont, setSelectedFont] = useState('Outfit');
  const [selectedColor, setSelectedColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(36);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);

  const handleAddText = (e) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    onAddText(textContent, {
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: selectedColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
    });
  };

  const handleColorChange = (hex) => {
    setSelectedColor(hex);
    if (activeObject && activeObject.type === 'i-text') {
      onUpdateActiveObject('fill', hex);
    }
  };

  const handleFontChange = (fontFamily) => {
    setSelectedFont(fontFamily);
    if (activeObject && activeObject.type === 'i-text') {
      onUpdateActiveObject('fontFamily', fontFamily);
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Input & Add Button */}
      <form onSubmit={handleAddText} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Custom Text
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter text to print"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (activeObject && activeObject.type === 'i-text') {
                  onUpdateActiveObject('text', e.target.value);
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:text-slate-400 placeholder:font-normal"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Font Family Dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Typography Font
          </label>
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
          >
            {GOOGLE_FONTS.map((font) => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color Swatches */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Text Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => handleColorChange(hex)}
                style={{ backgroundColor: hex }}
                className={`w-6 h-6 rounded-full border border-slate-300 transition-all ${
                  selectedColor === hex ? 'ring-2 ring-orange-500 ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Style Controls (Bold, Italic, Alignments) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              const next = !isBold;
              setIsBold(next);
              if (activeObject) onUpdateActiveObject('fontWeight', next ? 'bold' : 'normal');
            }}
            className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
              isBold ? 'bg-orange-50 border-orange-300 text-orange-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !isItalic;
              setIsItalic(next);
              if (activeObject) onUpdateActiveObject('fontStyle', next ? 'italic' : 'normal');
            }}
            className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
              isItalic ? 'bg-orange-50 border-orange-300 text-orange-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => activeObject && onUpdateActiveObject('textAlign', 'left')}
            className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => activeObject && onUpdateActiveObject('textAlign', 'center')}
            className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => activeObject && onUpdateActiveObject('textAlign', 'right')}
            className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
