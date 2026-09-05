import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Menu, 
  X, 
  User, 
  Printer, 
  LogOut, 
  Truck, 
  Package,
  KeyRound,
  ChevronRight 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import AuthModal from '../auth/AuthModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  const userMenuRef = useRef(null);

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { customer, isAuthenticated, logout } = useAuth();
  const { settings } = useStore();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Value Proposition Top Bar */}
      <div className="bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>⚡ DTF Printing • Sublimation • T-Shirts • Shirts • Mugs • Caps • Keychains</span>
        </span>
        <span className="hidden sm:inline text-orange-200/70">•</span>
        <span className="hidden sm:inline text-orange-50 font-semibold">300 DPI Studio Quality & Fast Dispatch</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          
          {/* Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 font-['Outfit'] block leading-none">
                  {settings.storeName || 'MANA VIBE'}
                </span>
                <span className="text-[9px] uppercase font-black tracking-widest text-orange-600 block leading-tight">
                  PRINTS STUDIO
                </span>
              </div>
            </Link>
          </div>

          {/* Clean Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            
            {/* Home Link */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              Home
            </Link>

            {/* Catalog Link */}
            <Link
              to="/catalog"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/catalog' && !location.search
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              All Blanks & Merch
            </Link>

            {/* Direct 2D Customizer Highlight */}
            <Link
              to="/catalog"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>2D Customizer Studio</span>
            </Link>

          </nav>

          {/* Right Action Tools: Track Order, Cart Drawer, Customer Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Track Order */}
            <Link
              to="/track"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-orange-700 hover:bg-orange-50 transition-colors border border-slate-200"
            >
              <Truck className="w-3.5 h-3.5 text-orange-600" />
              <span>Track Order</span>
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-orange-700 font-black text-[11px] flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Customer Authentication (Profile / Sign In) */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-900 text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                    {customer?.name?.charAt(0) || customer?.phone?.slice(-2) || 'U'}
                  </div>
                  <span className="hidden sm:inline">{customer?.name || customer?.phone}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-fadeIn text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{customer?.name || 'Verified Customer'}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{customer?.phone}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold"
                    >
                      <Package className="w-4 h-4 text-orange-600" />
                      My Orders
                    </Link>
                    <Link
                      to="/track"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold"
                    >
                      <Truck className="w-4 h-4 text-orange-600" />
                      Track Order & Proofs
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAuthModalMode('update_pin');
                        setAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-orange-600" />
                      Change Secret PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-fadeIn shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
            >
              Home
            </Link>

            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
            >
              All Blank Products & Merch
            </Link>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span>My Orders</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-orange-700 bg-orange-50"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600" />
                  <span>Track Order</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Customer Mobile + PIN Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}
    </>
  );
}
