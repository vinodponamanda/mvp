import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Truck, 
  Save, 
  Loader2, 
  Check, 
  Crosshair 
} from 'lucide-react';
import api from '../api/client';

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    storeName: 'Mana Vibe Prints',
    phone: '+91 9876543210',
    whatsApp: '+91 9876543210',
    email: 'support@manavibeprints.com',
    address: 'Plot 42, Hitech City Main Road, Hyderabad, Telangana - 500081',
    gpsLatitude: 17.4486,
    gpsLongitude: 78.3742,
    freeDeliveryRadiusKm: 15.0,
    maxServiceRadiusKm: 60.0,
    baseDeliveryCharge: 99.0,
    minOrderValue: 299.0,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSettings(prev => ({
            ...prev,
            gpsLatitude: Math.round(pos.coords.latitude * 100000) / 100000,
            gpsLongitude: Math.round(pos.coords.longitude * 100000) / 100000,
          }));
        },
        (err) => {
          alert('Could not retrieve current location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put('/admin/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Store & Delivery Settings</h2>
          <p className="text-xs text-slate-500 font-medium">Configure business contact info, store GPS coordinates & Haversine delivery rules</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" /> Store and delivery settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs">
          {error}
        </div>
      )}

      {/* 1. Store Profile Details */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-600" /> Store Profile & Communication
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Support Email *</label>
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">WhatsApp Notification Number *</label>
            <input
              type="text"
              required
              value={settings.whatsApp}
              onChange={(e) => setSettings({ ...settings, whatsApp: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-mono shadow-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Physical Store Address *</label>
            <textarea
              rows={2}
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. GPS Location & Delivery Radius Rules */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" /> Delivery Radiuses & GPS Coordinates (Haversine Formula)
          </h3>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors shadow-xs"
          >
            <Crosshair className="w-3.5 h-3.5 text-orange-600" /> Detect Current GPS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Store GPS Latitude *</label>
            <input
              type="number"
              step="0.0001"
              required
              value={settings.gpsLatitude}
              onChange={(e) => setSettings({ ...settings, gpsLatitude: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Store GPS Longitude *</label>
            <input
              type="number"
              step="0.0001"
              required
              value={settings.gpsLongitude}
              onChange={(e) => setSettings({ ...settings, gpsLongitude: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Free Delivery Radius (km) *</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={settings.freeDeliveryRadiusKm}
              onChange={(e) => setSettings({ ...settings, freeDeliveryRadiusKm: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-emerald-700 font-black focus:outline-none focus:border-orange-500 shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Orders within this distance receive free shipping (₹0)</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Maximum Service Radius (km) *</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={settings.maxServiceRadiusKm}
              onChange={(e) => setSettings({ ...settings, maxServiceRadiusKm: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-orange-600 font-black focus:outline-none focus:border-orange-500 shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Orders outside this radius will be rejected at checkout</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Base Delivery Fee (₹) *</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={settings.baseDeliveryCharge}
              onChange={(e) => setSettings({ ...settings, baseDeliveryCharge: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Applied when customer location is beyond free radius</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Minimum Order Value (₹) *</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={settings.minOrderValue}
              onChange={(e) => setSettings({ ...settings, minOrderValue: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Minimum cart total to proceed with checkout</p>
          </div>
        </div>
      </div>
    </form>
  );
}
