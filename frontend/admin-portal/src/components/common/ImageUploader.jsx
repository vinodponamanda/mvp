import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Check, Loader2, X, Image as ImageIcon } from 'lucide-react';
import api from '../../api/client';

export default function ImageUploader({ 
  value, 
  onChange, 
  folder = 'mockups', 
  label = 'Upload Image',
  recommendedText = 'PNG, JPG, WEBP (min 1200x1200px recommended)'
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/uploads/image?folder=${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        onChange(response.data.url);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload image. Try pasting a direct URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-3">
          <img 
            src={value} 
            alt="Preview" 
            className="w-16 h-16 rounded-lg object-contain bg-white border border-slate-200 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <Check className="w-3.5 h-3.5" /> Image attached successfully
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          {!showUrlInput ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`
                border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-150 bg-white
                ${uploading 
                  ? 'border-brand-500 bg-brand-50/40' 
                  : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50/20'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin mb-1" />
                  <p className="text-xs font-bold text-brand-700">Uploading to Cloudinary...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-1.5 shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag file here
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{recommendedText}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
              >
                Set URL
              </button>
            </form>
          )}

          <div className="flex items-center justify-between mt-1 px-1">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              {showUrlInput ? 'Upload file instead' : 'Or paste direct image URL'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
