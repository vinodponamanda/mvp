import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomizerPage from './pages/CustomizerPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';

export default function App() {
  return (
    <Router>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-stone-50/60 text-slate-800">
              {/* Global Top Navbar */}
              <Navbar />

              {/* Main Application View */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/customize/:id" element={<CustomizerPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/track" element={<OrderTrackingPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/orders" element={<MyOrdersPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Global Slide-out Cart Drawer */}
              <CartDrawer />

              {/* Global Footer */}
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </Router>
  );
}
