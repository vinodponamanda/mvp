import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertTriangle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function ArtworkUploader({ onAddArtwork, currentDpi, activeZone }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    try {
      setUploading(true);

      // 1. Read file as Data URL to get base64 data and pixel dimensions
      const reader = new FileReader();
      const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const dataUrl = await dataUrlPromise;

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = () => resolve();
      });

      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // 2. Direct upload to Cloudinary backend API
      let finalUrl = dataUrl;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'customer-artworks');
        const res = await api.post('/uploads/artwork', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          finalUrl = res.data.url;
        }
      } catch (err) {
        console.warn('Backend Cloudinary direct upload error, using pristine Base64 data URI fallback:', err);
      }

      setPreviewUrl(finalUrl);
      onAddArtwork(finalUrl, naturalWidth, naturalHeight);
    } catch (err) {
      console.error('File process failed:', err);
      alert('Failed to process image file. Please try another graphic.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-150
          ${dragActive 
            ? 'border-orange-500 bg-orange-500/10' 
            : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50/40 bg-slate-50/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-xs font-bold text-slate-700">Uploading High-Res Graphic...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Click to upload or drag & drop artwork
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG (Transparent background recommended), JPG, SVG, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Live DPI Resolution Badge & Quality Status */}
      {currentDpi && (
        <div className={`p-3.5 rounded-2xl border transition-all ${
          currentDpi >= 300 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : currentDpi >= 150 
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentDpi >= 300 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : currentDpi >= 150 ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="text-xs font-black">
                {currentDpi} DPI Print Resolution
              </span>
            </div>

            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              currentDpi >= 300
                ? 'bg-emerald-200 text-emerald-900'
                : currentDpi >= 150
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-rose-200 text-rose-900 animate-pulse'
            }`}>
              {currentDpi >= 300 ? 'Ultra-Crisp HD' : currentDpi >= 150 ? 'Standard Print' : 'Low Resolution'}
            </span>
          </div>

          <p className="text-[11px] mt-1 opacity-90 font-medium">
            {currentDpi >= 300
              ? 'Your artwork has exceptional pixel clarity and will print super sharp on our DTF heat-press printers.'
              : currentDpi >= 150
                ? 'Good quality for standard apparel printing. Scale down slightly for sharper details.'
                : 'Warning: This graphic is low resolution and may appear blurry when printed. Try uploading a higher-resolution file.'}
          </p>
        </div>
      )}
    </div>
  );
}
