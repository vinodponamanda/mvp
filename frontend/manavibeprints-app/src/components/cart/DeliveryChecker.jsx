import React, { useState } from 'react';
import { MapPin, Crosshair, Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function DeliveryChecker() {
  const { subtotal, deliveryInfo, setDeliveryInfo } = useCart();
  const [detecting, setDetecting] = useState(false);
  const [addressInput, setAddressInput] = useState(deliveryInfo?.address || '');
  const [error, setError] = useState(null);

  const calculateWithCoordinates = async (latitude, longitude, formattedAddress = '') => {
    try {
      setDetecting(true);
      setError(null);

      const res = await api.post('/delivery/calculate', {
        customerLatitude: latitude,
        customerLongitude: longitude,
        orderSubtotal: subtotal,
      });

      const data = res.data;
      setDeliveryInfo({
        fee: data.deliveryFee,
        distanceKm: data.distanceKm,
        isEligible: data.isEligibleForDelivery,
        rejectionReason: data.rejectionReason,
        address: formattedAddress || addressInput,
        gpsLat: latitude,
        gpsLng: longitude
      });
    } catch (err) {
      console.error('Delivery calculation failed:', err);
      setError(err.response?.data?.message || 'Could not verify delivery distance.');
    } finally {
      setDetecting(false);
    }
  };

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      setDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          calculateWithCoordinates(lat, lng, 'Current Detected Location');
        },
        (err) => {
          setDetecting(false);
          setError('Location access denied. Please type your city/area.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-orange-600" />
          Delivery Address
        </span>
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={detecting}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs transition-colors disabled:opacity-50"
        >
          {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3 text-orange-600" />}
          <span>Use My GPS</span>
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
          {error}
        </p>
      )}

      {deliveryInfo?.distanceKm > 0 && (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="text-slate-700">Distance to Studio:</span>
            <span className="text-slate-900 font-mono">{deliveryInfo.distanceKm} km</span>
          </div>

          <div className="flex items-center justify-between font-bold">
            <span className="text-slate-700">Delivery Fee:</span>
            <span className={deliveryInfo?.fee === 0 ? 'text-emerald-600 font-black' : 'text-orange-600'}>
              {deliveryInfo?.fee === 0 ? 'FREE (Within Free Radius)' : `₹${deliveryInfo?.fee || 0}`}
            </span>
          </div>

          {deliveryInfo?.isEligible === false && (
            <p className="text-[11px] text-rose-600 font-bold mt-1">
              ⚠️ {deliveryInfo?.rejectionReason || 'Address is beyond our maximum delivery service radius.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
