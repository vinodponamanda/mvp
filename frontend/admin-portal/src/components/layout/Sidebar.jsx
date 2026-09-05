import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Layers,
  ShoppingBag,
  Sliders,
  Printer,
  Users,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products & Blanks', href: '/products', icon: Shirt },
  { name: 'Categories', href: '/categories', icon: Layers },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Store & Delivery', href: '/settings', icon: Sliders },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col
        transition-transform duration-300 ease-in-out md:translate-x-0 shadow-sm
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/25">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-950 via-orange-950 to-slate-900 bg-clip-text text-transparent font-['Outfit']">
                MANA VIBE
              </div>
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-orange-600">Custom Prints Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Store Management</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                  ${isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-orange-50/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 transition-transform duration-150 group-hover:scale-105" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}
