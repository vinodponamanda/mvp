import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  Shirt, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Plus,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/admin/orders?pageSize=10'),
        api.get('/admin/products')
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const pendingProofs = orders.filter(o => o.status === 'Pending').length;

  const handleOpenOrder = async (orderSummary) => {
    try {
      const res = await api.get(`/admin/orders/${orderSummary.id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setSelectedOrder(res.data);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              On-Demand Print Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit']">
              Mana Vibe Prints Command Center
            </h2>
            <p className="text-sm text-orange-100 max-w-xl font-medium">
              Manage product bounding box zones, bulk volume matrices, and download 300 DPI high-res artwork files directly for heat-press & DTF printing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all backdrop-blur-xs cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/products/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-orange-600" /> New Customizable Blank
            </Link>
            <Link
              to="/orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-800/60 hover:bg-orange-800 text-white text-xs font-bold border border-white/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> View Orders ({orders.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Clickable Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <Link 
          to="/orders"
          className="glass-card p-5 rounded-2xl space-y-3 hover:border-orange-400 hover:shadow-md transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-['Outfit']">{orders.length}</span>
            <span className="text-xs text-orange-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> View All &rarr;
            </span>
          </div>
        </Link>

        {/* Revenue */}
        <Link 
          to="/orders"
          className="glass-card p-5 rounded-2xl space-y-3 hover:border-emerald-400 hover:shadow-md transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Total Sales</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-['Outfit']">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-emerald-700 font-bold">Active Orders &rarr;</span>
          </div>
        </Link>

        {/* Pending Proofs */}
        <Link 
          to="/orders"
          className="glass-card p-5 rounded-2xl space-y-3 hover:border-amber-400 hover:shadow-md transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Pending Proofs</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-['Outfit']">{pendingProofs}</span>
            <span className="text-xs text-amber-700 font-bold">Needs Review &rarr;</span>
          </div>
        </Link>

        {/* Catalog Blanks */}
        <Link 
          to="/products"
          className="glass-card p-5 rounded-2xl space-y-3 hover:border-orange-400 hover:shadow-md transition-all group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Catalog Blanks</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 group-hover:scale-110 transition-transform">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-['Outfit']">{products.length}</span>
            <span className="text-xs text-rose-700 font-bold">Manage Blanks &rarr;</span>
          </div>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 font-['Outfit']">Recent Orders Stream</h3>
            <p className="text-xs text-slate-500">Latest customer custom garment & mug orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
              <span>Refresh List</span>
            </button>
            <Link
              to="/orders"
              className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-orange-400" />
            <p className="text-sm font-bold text-slate-600">No orders received yet</p>
            <p className="text-xs text-slate-400 mt-1">Orders placed from storefront will stream here automatically</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50/60">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr 
                    key={order.id}
                    onClick={() => handleOpenOrder(order)}
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {order.firstItemPreviewUrl ? (
                        <img 
                          src={order.firstItemPreviewUrl} 
                          alt="Thumbnail" 
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          Proof
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenCancelModal={() => {}}
        />
      )}
    </div>
  );
}
