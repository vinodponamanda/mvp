import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mvp_customer_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('mvp_customer_profile');
    if (token && savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch {
        localStorage.removeItem('mvp_customer_profile');
      }
    }
    setLoading(false);
  }, [token]);

  // Customer Login with Mobile + PIN
  const login = async (mobileNumber, pin) => {
    const cleanMobile = (mobileNumber || '').replace(/\D/g, '');
    const res = await api.post('/auth/customer/login', {
      mobileNumber: cleanMobile,
      pin: pin?.trim()
    });

    const { token: jwtToken, customer: profile, mustChangePin } = res.data;
    if (jwtToken) {
      const customerData = {
        id: profile.id,
        name: profile.fullName,
        fullName: profile.fullName,
        phone: profile.mobileNumber,
        mobileNumber: profile.mobileNumber,
        mustChangePin: Boolean(mustChangePin)
      };

      localStorage.setItem('mvp_customer_token', jwtToken);
      localStorage.setItem('mvp_customer_profile', JSON.stringify(customerData));
      setToken(jwtToken);
      setCustomer(customerData);
      return { ...customerData, mustChangePin: Boolean(mustChangePin) };
    }
    return res.data;
  };

  // Customer Register with Name, Mobile, and PIN
  const register = async (fullName, mobileNumber, pin) => {
    const cleanMobile = (mobileNumber || '').replace(/\D/g, '');
    const res = await api.post('/auth/customer/register', {
      fullName: fullName?.trim(),
      mobileNumber: cleanMobile,
      pin: pin?.trim()
    });

    const { token: jwtToken, customer: profile } = res.data;
    if (jwtToken) {
      const customerData = {
        id: profile.id,
        name: profile.fullName,
        fullName: profile.fullName,
        phone: profile.mobileNumber,
        mobileNumber: profile.mobileNumber,
        mustChangePin: false
      };

      localStorage.setItem('mvp_customer_token', jwtToken);
      localStorage.setItem('mvp_customer_profile', JSON.stringify(customerData));
      setToken(jwtToken);
      setCustomer(customerData);
      return customerData;
    }
    return profile;
  };

  // Customer Change PIN (for temporary PIN override or regular update)
  const changePin = async (newPin) => {
    const res = await api.post('/auth/customer/change-pin', {
      newPin: newPin?.trim()
    });

    const { token: jwtToken, customer: profile } = res.data;
    if (jwtToken) {
      const customerData = {
        id: profile.id,
        name: profile.fullName,
        fullName: profile.fullName,
        phone: profile.mobileNumber,
        mobileNumber: profile.mobileNumber,
        mustChangePin: false
      };

      localStorage.setItem('mvp_customer_token', jwtToken);
      localStorage.setItem('mvp_customer_profile', JSON.stringify(customerData));
      setToken(jwtToken);
      setCustomer(customerData);
      return customerData;
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mvp_customer_token');
    localStorage.removeItem('mvp_customer_profile');
    localStorage.removeItem('mvp_last_phone');
    localStorage.removeItem('mvp_recent_orders');
    setToken(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{
      customer,
      token,
      loading,
      login,
      register,
      changePin,
      logout,
      isAuthenticated: Boolean(token)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
