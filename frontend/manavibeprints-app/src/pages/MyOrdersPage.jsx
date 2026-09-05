import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  FileCheck, 
  Cog, 
  CheckCheck, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  Shirt, 
  Copy, 
  Check, 
  MessageSquare, 
  Loader2, 
  Phone,
  Calendar,
  Sparkles,
  ShoppingBag,
  Lock,
  UserCheck
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import AuthModal from '../components/auth/AuthModal';

const STATUS_CONFIG = {
  Pending: { label: 'Order Placed', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: FileCheck },
  Artwork_Approved: { label: 'Proof Approved', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: CheckCircle2 },
  In_Production: { label: 'Printing & Pressing', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: Cog },
  Dispatched: { label: 'Dispatched', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', icon: Truck },
  Delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCheck },
  Cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: AlertCircle }
};

export default function MyOrdersPage() {
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [copiedNumber, setCopiedNumber] = useState(null);

  const cleanWhatsAppPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '') || '919876543210';

  const fetchOrders = async (phone) => {
    if (!phone || !phone.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const clean = phone.replace(/\D/g, '');
      const res = await api.get(`/orders/phone/${clean}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders by phone:', err);
      setError('Could not retrieve orders. Please check your connection.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (customer?.phone || customer?.mobileNumber)) {
      const activePhone = customer?.phone || customer?.mobileNumber;
      fetchOrders(activePhone);
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, customer]);

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') {
      return ['Pending', 'Artwork_Approved', 'In_Production', 'Dispatched'].includes(order.status);
    }
    if (activeFilter === 'DELIVERED') return order.status === 'Delivered';
    if (activeFilter === 'CANCELLED') return order.status === 'Cancelled';
    return true;
  });

  // If user is not signed in, show clean authentication prompt
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 font-['Outfit']">
            Sign In to View Your Orders
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please sign in with your mobile number and 4 to 6-digit PIN to access your past orders, invoice details, and live print production status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In With PIN</span>
          </button>

          <Link
            to="/track"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Track Single Order by ID</span>
          </Link>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                My Orders & Prints
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Signed in as <strong>{customer?.name || customer?.fullName || 'Customer'}</strong> (+91 {customer?.phone || customer?.mobileNumber})
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/track"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 shadow-xs transition-colors"
        >
          <Truck className="w-3.5 h-3.5 text-orange-600" />
          <span>Track by Order ID</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      {orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: `All Orders (${orders.length})` },
            { key: 'ACTIVE', label: `In Production / Active (${orders.filter(o => ['Pending', 'Artwork_Approved', 'In_Production', 'Dispatched'].includes(o.status)).length})` },
            { key: 'DELIVERED', label: `Delivered (${orders.filter(o => o.status === 'Delivered').length})` },
            { key: 'CANCELLED', label: `Cancelled (${orders.filter(o => o.status === 'Cancelled').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your custom print orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Order Top Bar: Reference ID & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-slate-900 font-['Outfit']">
                      {order.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.orderNumber)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedNumber === order.orderNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Order Body Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail and item summary */}
                  <div className="flex items-center gap-3.5">
                    {order.firstItemPreviewUrl ? (
                      <img
                        src={order.firstItemPreviewUrl}
                        alt="Order Mockup"
                        className="w-16 h-16 rounded-2xl object-contain bg-slate-50 border border-slate-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                        <Shirt className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {order.itemCount} Customized Product{order.itemCount !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Payment: <strong className="text-slate-700">{order.paymentMethod}</strong> ({order.paymentStatus})
                      </p>
                    </div>
                  </div>

                  {/* Right: Total Price & Track Order Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block sm:text-right">
                        Order Total
                      </span>
                      <span className="text-lg font-black text-orange-600 font-['Outfit'] block sm:text-right">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/track?orderNumber=${encodeURIComponent(order.orderNumber)}`)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <a
                        href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(`Hello ${settings.storeName || 'Mana Vibe Prints'}, I am checking status on order ${order.orderNumber}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
                        title="WhatsApp Updates"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 rounded-3xl bg-white border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
            <Shirt className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You haven't placed any custom print orders yet. Start creating your unique prints today!
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Blank Apparel</span>
          </Link>
        </div>
      )}

      {/* Auth Modal if triggered */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

    </div>
  );
}
