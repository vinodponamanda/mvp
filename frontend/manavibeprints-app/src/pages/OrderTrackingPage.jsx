import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  FileCheck, 
  Cog, 
  CheckCheck, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Loader2, 
  Shirt, 
  AlertCircle,
  ArrowLeft,
  Package 
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const STAGES = [
  { key: 'Pending', label: 'Order Placed', icon: FileCheck },
  { key: 'Artwork_Approved', label: 'Proof Approved', icon: CheckCircle2 },
  { key: 'In_Production', label: 'Printing & Pressing', icon: Cog },
  { key: 'Dispatched', label: 'Dispatched', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCheck }
];

export default function OrderTrackingPage() {
  const { settings } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialOrderNumber = queryParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialOrderNumber));
  const [error, setError] = useState(null);

  const fetchOrder = async (searchNum) => {
    if (!searchNum || !searchNum.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const cleanNum = searchNum.trim().replace(/^#+/, '');
      const res = await api.get(`/orders/lookup?orderNumber=${encodeURIComponent(cleanNum)}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Order tracking failed:', err);
      setError(err.response?.data?.message || 'No order found with this tracking reference.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const currentStageIndex = order ? STAGES.findIndex(s => s.key === order.status) : 0;

  const handleWhatsApp = () => {
    if (!order) return;
    const cleanPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '') || '919876543210';
    const text = encodeURIComponent(
      `Hello ${settings.storeName || 'Mana Vibe Prints'}, I am checking the status of my order #${order.orderNumber}. Could you provide an update?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All My Orders</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-['Outfit']">Track Order & Proof Status</h1>
        <p className="text-xs text-slate-500 font-medium">
          Enter your Order Number (e.g. <strong className="font-mono text-orange-600">MVP-12345</strong>) to view production stages
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Enter Order Number (e.g. #MVP-12345)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Track</span>}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Order Status Details Card */}
      {order && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden space-y-6 animate-fadeIn">
          
          {/* Top Banner */}
          <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono text-base font-black text-orange-600">{order.orderNumber}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} customized items
              </p>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs transition-colors self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Studio Team</span>
            </button>
          </div>

          {/* Milestone Progression Tracker */}
          <div className="p-6 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Production Status</p>
            
            {order.status !== 'Cancelled' ? (
              <div className="grid grid-cols-5 gap-2 text-center pt-2">
                {STAGES.map((stage, idx) => {
                  const isPassed = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center">
                      <div className={`
                        w-9 h-9 rounded-2xl flex items-center justify-center mb-1.5 text-xs transition-all shadow-xs
                        ${isCurrent ? 'bg-orange-600 text-white ring-4 ring-orange-100 font-bold scale-110' : ''}
                        ${isPassed && !isCurrent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' : ''}
                        ${!isPassed ? 'bg-slate-100 text-slate-400' : ''}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Order Cancelled
                </p>
                <p className="text-xs">{order.cancellationReason || 'Order was declined or cancelled.'}</p>
              </div>
            )}
          </div>

          {/* Ordered Custom Items with Composite Mockup Proofs */}
          <div className="p-6 border-t border-slate-100 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customized Items in Order</p>

            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    {item.customizations?.[0]?.compositeMockupUrl ? (
                      <img
                        src={item.customizations[0].compositeMockupUrl}
                        alt="Proof"
                        className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Shirt className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Color: <strong className="text-slate-700">{item.colorName}</strong> • Size: <strong className="text-slate-700">{item.sizeLabel}</strong> • Qty: <strong className="text-slate-700">{item.quantity}</strong>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {item.customizations?.map((c, cIdx) => (
                          <span key={cIdx} className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold border border-orange-200">
                            {c.position} ({c.selectedPrintMethod})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-sm font-black text-orange-600 self-end sm:self-center font-['Outfit']">
                    ₹{item.totalPrice}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Summary */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Shipping Address</span>
              <p className="text-slate-900 font-semibold mt-0.5 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                {order.deliveryAddress}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-slate-500 block font-medium">Payment & Total</span>
              <p className="text-slate-800 font-semibold">{order.paymentMethod} • Status: <strong className="text-emerald-700">{order.paymentStatus}</strong></p>
              <p className="text-lg font-black text-orange-600 font-['Outfit']">Total: ₹{order.totalAmount}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
