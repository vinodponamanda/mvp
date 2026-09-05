import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Sparkles, ShieldCheck, Truck, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();

  const cleanPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '');

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Value Proposition Bar */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">300 DPI Ultra-HD Print</p>
              <p className="text-[11px] text-slate-400">Crisp, vibrant colors that never wash out</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Fast Local Dispatch</p>
              <p className="text-[11px] text-slate-400">Direct courier to your door with GPS radius rules</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">100% Quality Inspected</p>
              <p className="text-[11px] text-slate-400">Pre-shrunk, soft touch premium blank apparel</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Proof Support</p>
              <p className="text-[11px] text-slate-400">Live order proof approval before printing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-white font-['Outfit'] uppercase">
              {settings.storeName || 'MANA VIBE PRINTS'}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Your dedicated on-demand studio for 300 DPI DTF Printing, Sublimation Printing, Ceramic Mugs, Custom Caps, Personalized Keychains, Formal Shirts, and Bio-Washed T-Shirts.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Custom Products</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">DTF Printing</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Sublimation Printing</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Custom T-Shirts (Round Neck & Oversize)</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Formal & Casual Shirts</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Custom Ceramic & Magic Mugs</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Custom Caps & Headwear</Link></li>
            <li><Link to="/catalog" className="hover:text-orange-400 transition-colors">Personalized Keychains</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Service</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/track" className="hover:text-orange-400 transition-colors">Track Order Status</Link></li>
            <li>
              <a 
                href={`https://wa.me/${cleanPhone || '919876543210'}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-orange-400 transition-colors"
              >
                WhatsApp Assistance
              </a>
            </li>
            <li><span className="text-slate-400">Bulk & Corporate Quotes</span></li>
            <li><span className="text-slate-400">Print Quality Guarantee</span></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Studio Contact</h4>
          <p className="flex items-center gap-2 text-slate-400">
            <Phone className="w-3.5 h-3.5 text-orange-400" /> {settings.phone || '+91 9876543210'}
          </p>
          <p className="flex items-center gap-2 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-orange-400" /> {settings.email || 'support@manavibeprints.com'}
          </p>
          <p className="flex items-start gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
            {settings.address || 'Pedalanka, Eluru District, Andhra Pradesh 534010'}
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-6 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} {settings.storeName || 'Mana Vibe Prints'}. All rights reserved.
      </div>
    </footer>
  );
}
