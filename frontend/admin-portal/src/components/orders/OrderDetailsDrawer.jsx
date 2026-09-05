import React, { useState } from 'react';
import { 
  X, 
  Download, 
  MessageSquare, 
  Printer, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Cog, 
  Truck, 
  CheckCheck, 
  AlertCircle,
  FileCheck,
  Loader2
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import api from '../../api/client';

const STAGES = [
  { key: 'Pending', label: 'Order Placed', icon: FileCheck },
  { key: 'Artwork_Approved', label: 'Proof Approved', icon: CheckCircle2 },
  { key: 'In_Production', label: 'Printing / Pressing', icon: Cog },
  { key: 'Dispatched', label: 'Dispatched', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCheck }
];

export default function OrderDetailsDrawer({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onOpenCancelModal 
}) {
  const [downloadingKey, setDownloadingKey] = useState(null);
  if (!order) return null;

  const currentStageIndex = STAGES.findIndex(s => s.key === order.status);

  // Pre-fill WhatsApp message
  const handleWhatsAppCustomer = () => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${order.customerName}, this is Mana Vibe Prints regarding your order ${order.orderNumber}. Current status: ${order.status.replace('_', ' ')}. Feel free to contact us with any questions!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  const handlePrintJobSlip = () => {
    window.print();
  };

  // Helper: Trigger browser file save directly from Blob
  const saveBlob = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  };

  // Helper: Convert Data URI to binary Blob
  const dataURItoBlob = (dataURI) => {
    const split = dataURI.split(',');
    const mimeMatch = split[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(split[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mime });
  };

  // Universal high-res artwork downloader with multi-layer fallback
  const handleDownloadArtwork = async (url, position = 'Front', orderNum = 'Order', key = 'front', label = 'Artwork') => {
    if (!url) return;

    setDownloadingKey(key);
    const safeFilename = `${orderNum}_${position}_${label}.png`.replace(/[#\s]/g, '_');

    try {
      // 1. If Base64 Data URI
      if (url.startsWith('data:')) {
        const blob = dataURItoBlob(url);
        saveBlob(blob, safeFilename);
        return;
      }

      // 2. If Cloudinary URL, construct fl_attachment URL to force native browser download
      let cloudinaryDownloadUrl = url;
      if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        const baseNameWithoutExt = safeFilename.replace(/\.[^/.]+$/, '');
        cloudinaryDownloadUrl = url.replace('/upload/', `/upload/fl_attachment:${baseNameWithoutExt}/`);
      }

      // 3. Try direct fetch blob
      try {
        const res = await fetch(cloudinaryDownloadUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 0) {
            saveBlob(blob, safeFilename);
            return;
          }
        }
      } catch (corsErr) {
        console.warn('Direct fetch failed, trying backend download proxy:', corsErr);
      }

      // 4. Try backend download proxy (bypasses any browser CORS)
      try {
        const proxyRes = await api.get(`/admin/orders/download-file?url=${encodeURIComponent(url)}&fileName=${encodeURIComponent(safeFilename)}`, {
          responseType: 'blob'
        });
        if (proxyRes.data) {
          saveBlob(proxyRes.data, safeFilename);
          return;
        }
      } catch (proxyErr) {
        console.warn('Backend proxy download failed, falling back to anchor element:', proxyErr);
      }

      // 5. Native Anchor click
      const a = document.createElement('a');
      a.href = cloudinaryDownloadUrl;
      a.setAttribute('download', safeFilename);
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 1000);
    } catch (err) {
      console.error('Download error:', err);
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloadingKey(null), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 font-['Outfit']">{order.orderNumber}</h2>
                <StatusBadge status={order.status} type="order" />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Milestone Progression Tracker */}
            {order.status !== 'Cancelled' ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Order Production Pipeline</p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {STAGES.map((stage, idx) => {
                    const isPassed = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;
                    const Icon = stage.icon;

                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs transition-all shadow-xs
                          ${isCurrent ? 'bg-orange-600 text-white ring-4 ring-orange-100 font-bold' : ''}
                          ${isPassed && !isCurrent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' : ''}
                          ${!isPassed ? 'bg-slate-200 text-slate-400' : ''}
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Order Cancelled / Declined
                </p>
                <p className="text-xs font-medium">Reason: {order.cancellationReason || 'No reason specified'}</p>
              </div>
            )}

            {/* 2. Customer & Delivery Info */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer & Shipping Details</p>
                <button
                  type="button"
                  onClick={handleWhatsAppCustomer}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Customer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Customer Name</span>
                  <span className="text-slate-900 font-bold text-sm">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Phone Number</span>
                  <a href={`tel:${order.customerPhone}`} className="text-orange-700 font-bold hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3 text-orange-600" /> {order.customerPhone}
                  </a>
                </div>
                {order.customerEmail && (
                  <div>
                    <span className="text-slate-500 block font-medium">Email Address</span>
                    <span className="text-slate-800 font-semibold">{order.customerEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block font-medium">Payment Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-slate-800 font-bold">{order.paymentMethod}</span>
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block font-medium">Delivery Address</span>
                  <p className="text-slate-800 font-semibold mt-0.5 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Ordered Custom Items & Production Files Hub */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Customized Items ({order.items?.length || 0}) & Production Files
                </p>
                <button
                  type="button"
                  onClick={handlePrintJobSlip}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Job Slip
                </button>
              </div>

              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Color: <strong className="text-slate-800">{item.colorName || 'Default'}</strong> • 
                        Size: <strong className="text-slate-800">{item.sizeLabel || 'Free'}</strong> • 
                        Material: <strong className="text-slate-800">{item.materialName || 'Standard'}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">Qty: {item.quantity}</span>
                      <p className="text-xs text-orange-600 font-black">₹{item.totalPrice}</p>
                    </div>
                  </div>

                  {/* Print Zones & High-Res Download Links */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {item.customizations?.map((cust, cIdx) => (
                      <div key={cIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {cust.compositeMockupUrl ? (
                            <img
                              src={cust.compositeMockupUrl}
                              alt="Proof"
                              className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-xs">
                              {cust.position}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{cust.position} Print</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold border border-orange-200">
                                {cust.selectedPrintMethod}
                              </span>
                              {cust.estimatedDpi >= 300 ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                  {cust.estimatedDpi} DPI (Crisp)
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                  {cust.estimatedDpi} DPI
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                              Print Area: {cust.physicalWidthInches || 10}" × {cust.physicalHeightInches || 12}"
                            </p>
                          </div>
                        </div>

                        {/* 1-Click High-Res Artwork Download Actions */}
                        {(cust.originalArtworkUrl || cust.compositeMockupUrl) ? (
                          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                            {cust.originalArtworkUrl ? (
                              <button
                                type="button"
                                disabled={downloadingKey === `${idx}-${cIdx}-art`}
                                onClick={() => handleDownloadArtwork(
                                  cust.originalArtworkUrl, 
                                  cust.position, 
                                  order.orderNumber,
                                  `${idx}-${cIdx}-art`,
                                  'MasterArtwork'
                                )}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
                              >
                                {downloadingKey === `${idx}-${cIdx}-art` ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Downloading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Master Artwork</span>
                                  </>
                                )}
                              </button>
                            ) : null}

                            {cust.compositeMockupUrl ? (
                              <button
                                type="button"
                                disabled={downloadingKey === `${idx}-${cIdx}-proof`}
                                onClick={() => handleDownloadArtwork(
                                  cust.compositeMockupUrl, 
                                  cust.position, 
                                  order.orderNumber,
                                  `${idx}-${cIdx}-proof`,
                                  '300DPI_Proof'
                                )}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
                              >
                                {downloadingKey === `${idx}-${cIdx}-proof` ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving Proof...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>300 DPI Proof</span>
                                  </>
                                )}
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Text-only Customization</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Total Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Items Subtotal</span>
                <span>₹{order.totalAmount - (order.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-orange-600 text-base font-black">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
            {order.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenCancelModal(order)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-300"
                >
                  Decline Order
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, 'Artwork_Approved')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  Approve Proof & Artwork
                </button>
              </>
            )}

            {order.status === 'Artwork_Approved' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'In_Production')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                <Cog className="w-4 h-4" /> Move to Printing / Heat-Press
              </button>
            )}

            {order.status === 'In_Production' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'Dispatched')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" /> Mark Dispatched / Out for Delivery
              </button>
            )}

            {order.status === 'Dispatched' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'Delivered')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" /> Mark Order Delivered
              </button>
            )}

            {order.status === 'Delivered' && (
              <div className="w-full text-center text-xs font-bold text-emerald-800 py-1 flex items-center justify-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-600" /> Order Completed & Delivered
              </div>
            )}

            {order.status === 'Cancelled' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'Pending')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Re-open Order
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
