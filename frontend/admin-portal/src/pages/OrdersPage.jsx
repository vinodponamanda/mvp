import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Cog,
  Truck,
  CheckCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';
import CancellationModal from '../components/orders/CancellationModal';

const STATUS_PILLS = [
  { key: null, label: 'All Orders' },
  { key: 'Pending', label: 'Pending Proof' },
  { key: 'Artwork_Approved', label: 'Proof Approved' },
  { key: 'In_Production', label: 'In Production' },
  { key: 'Dispatched', label: 'Dispatched' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  const fetchOrders = async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const url = activeFilter
        ? `/admin/orders?status=${activeFilter}&search=${encodeURIComponent(searchTerm)}`
        : `/admin/orders?search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, searchTerm]);

  const handleOpenOrder = async (orderSummary) => {
    try {
      const res = await api.get(`/admin/orders/${orderSummary.id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        cancellationReason: reason
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.data);
      }
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, cancellationReason: reason } : o));
      setCancelModalOrder(null);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Order Production Pipeline</h2>
          <p className="text-xs text-slate-500 font-medium">Track custom garment printing jobs, proofs, and 300 DPI high-res artwork files</p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Status Filter Pills */}
        <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {STATUS_PILLS.map((pill) => {
            const isActive = activeFilter === pill.key;
            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => setActiveFilter(pill.key)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                `}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="glass-card p-3 rounded-2xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order # (e.g. #MVP-12345), Customer Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-orange-400" />
            <p className="text-sm font-bold text-slate-700">No orders matching current filter</p>
            <p className="text-xs text-slate-400">Try selecting another filter or clearing search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenOrder(order)}
                    className="hover:bg-orange-50/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-xs">
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
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
                          className="w-11 h-11 rounded-lg object-contain bg-white border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          Custom
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {order.itemCount} items
                    </td>

                    <td className="py-3.5 px-4 font-black text-orange-600">
                      ₹{order.totalAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Artwork_Approved')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 shadow-xs"
                              title="Approve Proof"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-300"
                              title="Decline"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {order.status === 'Artwork_Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'In_Production')}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-[11px] border border-orange-300 flex items-center gap-1 shadow-xs"
                          >
                            <Cog className="w-3 h-3 text-orange-600" /> Print / Press
                          </button>
                        )}

                        {order.status === 'In_Production' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Dispatched')}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] border border-stone-300 flex items-center gap-1 shadow-xs"
                          >
                            <Truck className="w-3 h-3 text-stone-600" /> Dispatch
                          </button>
                        )}

                        {order.status === 'Dispatched' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 flex items-center gap-1 shadow-xs"
                          >
                            <CheckCheck className="w-3 h-3 text-emerald-600" /> Mark Delivered
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenCancelModal={(ord) => setCancelModalOrder(ord)}
        />
      )}

      {/* Cancellation Modal */}
      {cancelModalOrder && (
        <CancellationModal
          isOpen={Boolean(cancelModalOrder)}
          orderNumber={cancelModalOrder.orderNumber}
          onClose={() => setCancelModalOrder(null)}
          onConfirm={(reason) => handleUpdateStatus(cancelModalOrder.id, 'Cancelled', reason)}
        />
      )}
    </div>
  );
}
