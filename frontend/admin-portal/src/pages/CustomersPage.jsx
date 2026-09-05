import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  KeyRound, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Calendar,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetModalCustomer, setResetModalCustomer] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await api.get('/admin/customers', {
        params: { search: search.trim() || undefined }
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setErrorMessage(err.response?.data?.message || 'Could not fetch customer accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetPin = async (e) => {
    e.preventDefault();
    if (!resetModalCustomer) return;
    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setErrorMessage('New PIN must be 4 to 6 numeric digits.');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await api.post(`/admin/customers/${resetModalCustomer.id}/reset-pin`, {
        newPin: newPin.trim()
      });

      setToastMessage(res.data?.message || `PIN reset successfully for ${resetModalCustomer.fullName}`);
      setResetModalCustomer(null);
      setNewPin('');
      fetchCustomers();

      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Failed to reset PIN:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to reset PIN.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlock = async (customer) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/customers/${customer.id}/unlock`);
      setToastMessage(res.data?.message || `Account for ${customer.fullName} unlocked.`);
      fetchCustomers();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to unlock customer:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to unlock customer.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-['Outfit']">Customer Accounts & Security</h1>
          <p className="text-xs text-slate-500">Manage registered customers, unlock accounts, and securely reset customer PINs</p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2.5 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name or 10-digit mobile number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading registered customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Customers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search ? 'No customer accounts matched your search keyword.' : 'Customers who create an account in the storefront will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4 sm:px-6">Customer Name</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">Status & Security</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4">Joined / Last Active</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                          {c.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      +91 {c.mobileNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> Locked (5 Failed PINs)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active & Secure
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 text-[11px]">
                        <ShoppingBag className="w-3 h-3 text-slate-500" /> {c.totalOrders}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>{new Date(c.createdAtUtc).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.lastLoginAtUtc ? `Active ${new Date(c.lastLoginAtUtc).toLocaleDateString()}` : 'Never logged in'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.isLocked && (
                          <button
                            type="button"
                            onClick={() => handleUnlock(c)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unlock</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setResetModalCustomer(c);
                            setNewPin('');
                            setErrorMessage(null);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 hover:border-orange-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset PIN</span>
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

      {/* RESET PIN MODAL */}
      {resetModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Reset Customer Account PIN</h3>
                  <p className="text-[11px] text-slate-500">Secure store admin PIN override</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{resetModalCustomer.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Registered Mobile:</span>
                <span className="font-mono font-bold text-slate-900">+91 {resetModalCustomer.mobileNumber}</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium leading-relaxed">
              ⚠️ <strong>Verification Checklist:</strong> Verify customer identity via phone/WhatsApp call before resetting. Existing PIN is encrypted and cannot be viewed.
            </div>

            {/* Form */}
            <form onSubmit={handleResetPin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New 4 to 6-Digit Numeric PIN *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={6}
                    placeholder="e.g. 5678"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Inform the customer to use this new PIN to sign in.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalCustomer(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Save & Reset PIN</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
