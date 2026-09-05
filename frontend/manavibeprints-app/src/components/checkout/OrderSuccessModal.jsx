import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Truck, 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Package 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';

export default function OrderSuccessModal({
  isOpen,
  order,
  onClose
}) {
  const navigate = useNavigate();
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignored
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackOrder = () => {
    if (onClose) onClose();
    navigate(`/track?orderNumber=${encodeURIComponent(order.orderNumber)}`);
  };

  const handleViewMyOrders = () => {
    if (onClose) onClose();
    navigate('/my-orders');
  };

  const handleContinueShopping = () => {
    if (onClose) onClose();
    navigate('/catalog');
  };

  const handleWhatsApp = () => {
    const cleanPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '') || '919876543210';
    const text = encodeURIComponent(
      `Hello ${settings.storeName || 'Mana Vibe Prints'}! I just placed order ${order.orderNumber} for ₹${order.totalAmount}. Looking forward to the print proofs!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scaleUp">
        
        {/* Celebration Animated Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-950 font-['Outfit']">
            Order Placed Successfully! 🎉
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Your custom print job has been queued for 300 DPI production.
          </p>
        </div>

        {/* Order Reference Number Card */}
        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">
            Transaction & Order Reference ID
          </span>

          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black text-slate-900">
              {order.orderNumber}
            </span>

            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Payment Method: <strong className="text-slate-900">Cash on Delivery (COD)</strong></span>
            <span>Total: <strong className="text-orange-600 font-black font-['Outfit'] text-sm">₹{order.totalAmount}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleTrackOrder}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order & Live Proofs</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleViewMyOrders}
              className="py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-orange-600" />
              <span>All My Orders</span>
            </button>

            <button
              type="button"
              onClick={handleContinueShopping}
              className="py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span>Shop More</span>
            </button>
          </div>
        </div>

        {/* Guarantee footer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Save your Order Reference ID to check live tracking at any time</span>
        </div>

      </div>
    </div>
  );
}
