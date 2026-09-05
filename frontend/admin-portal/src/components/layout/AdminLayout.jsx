import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, LogOut, User, Sliders, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products/new')) return 'Create Customizable Blank';
    if (path.startsWith('/products/edit')) return 'Edit Product Matrix & Zones';
    if (path.startsWith('/products')) return 'Customizable Blank Products';
    if (path.startsWith('/categories')) return 'Product Categories';
    if (path.startsWith('/orders')) return 'Order Production Pipeline';
    if (path.startsWith('/customers')) return 'Customer Accounts & PIN Security';
    if (path.startsWith('/settings')) return 'Store & Delivery Settings';
    return 'Admin Management';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50/50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Top Right Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white hover:bg-orange-50/60 border border-slate-200 hover:border-orange-200 text-slate-800 transition-all shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {user?.fullName || 'Administrator'}
                </p>
                <p className="text-[10px] font-semibold text-orange-600 leading-tight">
                  {user?.role || 'Admin'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-orange-600' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email || 'admin@manavibeprints.com'}</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-700 hover:bg-orange-50/60 rounded-xl transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span>Store Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
