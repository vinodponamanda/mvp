import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const DEFAULT_SETTINGS = {
  storeName: 'MANA VIBE PRINTS',
  phone: '+91 9876543210',
  whatsApp: '+91 9876543210',
  email: 'support@manavibeprints.com',
  address: 'Pedalanka, Eluru District, Andhra Pradesh 534010',
  gpsLatitude: 16.7107,
  gpsLongitude: 81.0952,
  freeDeliveryRadiusKm: 15.0,
  maxServiceRadiusKm: 60.0,
  baseDeliveryCharge: 99.0,
  minOrderValue: 299.0,
};

const StoreContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
});

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data) {
        setSettings({
          storeName: res.data.storeName || DEFAULT_SETTINGS.storeName,
          phone: res.data.phone || DEFAULT_SETTINGS.phone,
          whatsApp: res.data.whatsApp || DEFAULT_SETTINGS.whatsApp,
          email: res.data.email || DEFAULT_SETTINGS.email,
          address: res.data.address || DEFAULT_SETTINGS.address,
          gpsLatitude: res.data.gpsLatitude ?? DEFAULT_SETTINGS.gpsLatitude,
          gpsLongitude: res.data.gpsLongitude ?? DEFAULT_SETTINGS.gpsLongitude,
          freeDeliveryRadiusKm: res.data.freeDeliveryRadiusKm ?? DEFAULT_SETTINGS.freeDeliveryRadiusKm,
          maxServiceRadiusKm: res.data.maxServiceRadiusKm ?? DEFAULT_SETTINGS.maxServiceRadiusKm,
          baseDeliveryCharge: res.data.baseDeliveryCharge ?? DEFAULT_SETTINGS.baseDeliveryCharge,
          minOrderValue: res.data.minOrderValue ?? DEFAULT_SETTINGS.minOrderValue,
        });
      }
    } catch (err) {
      console.warn('Could not fetch dynamic store settings, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
export default StoreContext;
