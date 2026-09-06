import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import UpiQrPaymentModal from '../components/checkout/UpiQrPaymentModal';
import OrderSuccessModal from '../components/checkout/OrderSuccessModal';

export default function CheckoutPage() {
  const { items, subtotal, finalTotal, deliveryInfo, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Checkout Form State
  const [formData, setFormData] = useState({
    customerName: customer?.name || '',
    customerPhone: customer?.phone || '',
    customerEmail: customer?.email || '',
    deliveryAddress: deliveryInfo?.address || '',
    paymentMethod: 'Cash_On_Delivery' // Default to COD
  });

  // Sync with customer auth changes
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name || customer.fullName || prev.customerName,
        customerPhone: customer.phone || customer.mobileNumber || prev.customerPhone
      }));
    }
  }, [customer]);

  if (!successModalOpen && !createdOrder && items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
        >
          Explore Catalog & Customize
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const finalName = (formData.customerName || customer?.name || '').trim();
    const rawPhone = (formData.customerPhone || customer?.phone || '').replace(/\D/g, '');
    const finalPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;

    if (!finalName || finalName.length < 2) {
      setError('Please provide your full name.');
      return;
    }

    if (!finalPhone || finalPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!formData.deliveryAddress.trim()) {
      setError('Please provide a complete delivery street address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Assemble Order Payload matching .NET 10 DTO
      const payload = {
        customerName: finalName,
        customerPhone: finalPhone,
        customerEmail: formData.customerEmail || customer?.email || '',
        deliveryAddress: formData.deliveryAddress,
        gpsLatitude: deliveryInfo?.gpsLat || null,
        gpsLongitude: deliveryInfo?.gpsLng || null,
        customerLatitude: deliveryInfo?.gpsLat || null,
        customerLongitude: deliveryInfo?.gpsLng || null,
        paymentMethod: 'Cash_On_Delivery',
        items: items.map((item) => ({
          productId: item.productId,
          colorName: item.colorName,
          sizeLabel: item.sizeLabel,
          materialName: item.materialName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customizations: (item.customizations || []).map((c) => ({
            position: c.position || 'Front',
            selectedPrintMethod: c.selectedPrintMethod || 'DTF',
            originalArtworkUrl: c.originalArtworkUrl || '',
            compositeMockupUrl: c.compositeMockupUrl || item.previewMockupUrl || '',
            canvasJson: c.canvasJson || c.designJson || '{}',
            designJson: c.designJson || c.canvasJson || '{}',
            estimatedDpi: c.estimatedDpi || 300
          }))
        }))
      };

      const res = await api.post('/orders', payload);
      const order = res.data;
      setCreatedOrder(order);

      try {
        localStorage.setItem('mvp_last_phone', finalPhone);
        const recent = JSON.parse(localStorage.getItem('mvp_recent_orders') || '[]');
        const updated = [order.orderNumber, ...recent.filter(n => n !== order.orderNumber)].slice(0, 20);
        localStorage.setItem('mvp_recent_orders', JSON.stringify(updated));
      } catch (e) {
        // Ignored
      }

      clearCart();
      setSuccessModalOpen(true);
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpiConfirmed = () => {
    setUpiModalOpen(false);
    setSuccessModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="text-2xl font-black text-slate-900 font-['Outfit']">Secure Order Checkout</h1>
        </div>
      </div>

      {/* Guest vs Account Banner */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-orange-950 font-medium">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Have an account? Sign in with your PIN to autofill details, or simply checkout as <strong>Guest</strong> below.</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {error && (
        <p className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </p>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Customer Details & Shipping Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" /> Customer Information {isAuthenticated && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Signed In</span>}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Mobile Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-orange-500 shadow-xs placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="Enter email address (optional)"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" /> Delivery Address & Location
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Complete Street Address *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter complete street address, house no, landmark, pincode"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs placeholder:text-slate-400"
                />
              </div>

              {deliveryInfo?.address && (
                <div className="p-3 rounded-2xl bg-stone-50 border border-slate-200 text-slate-600 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">GPS Verified Destination:</span>
                    <span className="font-bold text-emerald-600">{deliveryInfo.distanceKm} km away</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{deliveryInfo.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" /> Select Payment Method
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Cash on Delivery (COD) Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* COD - Active & Selected */}
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-orange-600 bg-orange-50/50 ring-1 ring-orange-600">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash_On_Delivery"
                  checked={true}
                  readOnly
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash or UPI scan at your doorstep upon delivery.</p>
                </div>
              </div>

              {/* UPI QR - Disabled */}
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI_QR"
                  disabled
                  checked={false}
                  className="mt-0.5 text-slate-400 cursor-not-allowed"
                />
                <div>
                  <div className="font-bold text-slate-500 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-slate-400" /> Instant UPI QR Scan
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">Disabled</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct online UPI prepayment currently paused. We accept only Cash on Delivery (COD).</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-orange-600" /> Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Item List Compact */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <img
                    src={item.previewMockupUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150'}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.productName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {item.colorName || 'Color'} • {item.sizeLabel || 'Size'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 font-mono">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({items.reduce((s, i) => s + (i.quantity || 1), 0)} pcs)</span>
                <span className="font-bold text-slate-900 font-mono">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Doorstep Delivery Charge</span>
                <span className={`font-bold font-mono ${deliveryInfo?.fee === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {deliveryInfo?.fee === 0 ? 'FREE' : `₹${deliveryInfo?.fee || 0}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-base">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-black text-orange-600 font-mono text-xl">₹{finalTotal}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>300 DPI High-Resolution Quality Guarantee</span>
            </div>

          </div>
        </div>

      </form>

      {/* Order Success Confirmation Dialog */}
      {successModalOpen && createdOrder && (
        <OrderSuccessModal
          isOpen={successModalOpen}
          order={createdOrder}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}

      {/* Auth Modal (Mobile + PIN) */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          isCheckout={true}
          onClose={() => setAuthModalOpen(false)}
          onGuestCheckout={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}

      {/* UPI QR Payment Modal */}
      {upiModalOpen && createdOrder && (
        <UpiQrPaymentModal
          isOpen={upiModalOpen}
          onClose={() => setUpiModalOpen(false)}
          amount={finalTotal}
          orderNumber={createdOrder.orderNumber}
          onPaymentConfirmed={handleUpiConfirmed}
        />
      )}

    </div>
  );
}
