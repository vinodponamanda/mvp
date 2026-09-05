import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Shirt } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import DeliveryChecker from './DeliveryChecker';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal, finalTotal, deliveryInfo } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-black text-slate-900 font-['Outfit']">
                Your Custom Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scroll List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Shirt className="w-12 h-12 mx-auto opacity-30 text-orange-400" />
                <p className="text-sm font-bold text-slate-700">Your shopping cart is empty</p>
                <p className="text-xs text-slate-400">Choose a garment or mug to customize your unique prints</p>
                <Link
                  to="/catalog"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Explore Blank Products
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex gap-3.5 items-start"
                  >
                    {/* Mockup Preview Thumbnail */}
                    {item.previewMockupUrl ? (
                      <img
                        src={item.previewMockupUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Shirt className="w-6 h-6" />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.productName}</h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.colorName} • Size: <strong>{item.sizeLabel}</strong>
                        {item.materialName && ` • ${item.materialName}`}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-black text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-orange-600">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* GPS Delivery Distance Calculator Widget */}
                <DeliveryChecker />
              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className="font-bold">
                    {deliveryInfo?.fee === 0 ? 'FREE' : `₹${deliveryInfo?.fee || 0}`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-black text-orange-600 font-['Outfit']">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={deliveryInfo?.isEligible === false}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
