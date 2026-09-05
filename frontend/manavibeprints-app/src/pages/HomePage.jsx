import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Shirt, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  Palette, 
  Cpu, 
  Loader2,
  Coffee,
  Printer,
  Flame,
  Tag,
  ChevronDown,
  Calculator,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import api from '../api/client';
import { useStore } from '../context/StoreContext';

const getCategoryMeta = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('dtf') || n.includes('film')) {
    return {
      icon: Printer,
      bg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      badge: 'DTF Printing'
    };
  }
  if (n.includes('sublim') || n.includes('sublimation')) {
    return {
      icon: Sparkles,
      bg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      badge: 'Sublimation Print'
    };
  }
  if (n.includes('mug') || n.includes('cup') || n.includes('ceramic') || n.includes('drink')) {
    return {
      icon: Coffee,
      bg: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
      badge: 'Ceramic Mugs'
    };
  }
  if (n.includes('cap') || n.includes('hat')) {
    return {
      icon: Tag,
      bg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      badge: 'Custom Caps'
    };
  }
  if (n.includes('keychain') || n.includes('key chain') || n.includes('key ring')) {
    return {
      icon: Sparkles,
      bg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      badge: 'Custom Keychains'
    };
  }
  if (n.includes('tshirt') || n.includes('t-shirt') || n.includes('tee') || n.includes('oversize')) {
    return {
      icon: Shirt,
      bg: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
      badge: 'T-Shirts (180-240 GSM)'
    };
  }
  if (n.includes('shirt')) {
    return {
      icon: Shirt,
      bg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      badge: 'Shirts & Polos'
    };
  }
  if (n.includes('hoodie') || n.includes('sweatshirt')) {
    return {
      icon: Flame,
      bg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      badge: 'Heavyweight Fleece'
    };
  }
  return {
    icon: Shirt,
    bg: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    badge: 'Custom Merch'
  };
};

// Bulk Pricing Calculator helper
const calculateBulkPrice = (qty) => {
  const base = 399;
  if (qty >= 100) return { unitPrice: 189, discountPct: 53, tier: 'Wholesale Tier' };
  if (qty >= 50) return { unitPrice: 229, discountPct: 43, tier: 'Studio Bulk' };
  if (qty >= 20) return { unitPrice: 279, discountPct: 30, tier: 'Team Batch' };
  if (qty >= 5) return { unitPrice: 339, discountPct: 15, tier: 'Small Group' };
  return { unitPrice: base, discountPct: 0, tier: 'Standard Single' };
};

export default function HomePage() {
  const { settings } = useStore();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bulk calculator state
  const [calculatorQty, setCalculatorQty] = useState(25);
  const [faqOpen, setFaqOpen] = useState({ 0: true });

  const cleanWhatsAppPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '') || '919876543210';

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bulkEstimate = calculateBulkPrice(calculatorQty);
  const totalBulkCost = bulkEstimate.unitPrice * calculatorQty;
  const standardCost = 399 * calculatorQty;
  const totalSavings = standardCost - totalBulkCost;

  const faqs = [
    {
      q: "What printing services and products does Mana Vibe Prints support?",
      a: "We provide high-precision 300 DPI DTF Printing (Direct-to-Film transfers), Sublimation Printing, Ceramic Mugs, Custom Caps, Personalized Keychains, Formal & Casual Shirts, and Bio-Washed T-Shirts."
    },
    {
      q: "Is there a Minimum Order Quantity (MOQ)?",
      a: "No! You can order as few as 1 custom printed piece or up to 5,000+ units. Our automated studio dynamically applies volume tier discounts starting from just 5 pieces."
    },
    {
      q: "What file formats and image quality should I upload?",
      a: "For the crispest 300 DPI print output, upload transparent PNG, SVG, or high-resolution JPG files (at least 1500×1500 pixels). Our built-in 2D Studio features a live DPI clarity meter to instantly verify your artwork resolution before checkout."
    },
    {
      q: "How fast is order dispatch and delivery?",
      a: "Single customized orders and small batches are printed, heat-cured, and dispatched within 24 to 48 business hours. Bulk institutional orders (50+ pcs) typically ship within 3-4 business days with real-time GPS tracking."
    },
    {
      q: "Can I inspect a digital proof before printing?",
      a: "Yes! Every customized order generates a 300 DPI high-resolution proof mockup. Our print operators inspect every layout, and for customized bulk orders, we verify proofs directly over WhatsApp before starting the press run."
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/40 to-white pt-12 pb-20 border-b border-orange-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-900 text-xs font-black shadow-2xs">
                <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
                <span>DTF Printing • Sublimation • T-Shirts • Shirts • Mugs • Caps • Keychains</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-['Outfit'] leading-[1.1]">
                Wear Your Vibe.<br />
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 bg-clip-text text-transparent">
                  Custom Printed in 300 DPI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Your dedicated custom printing studio for DTF Printing, Sublimation Printing, Ceramic Mugs, Caps, Custom Keychains, Formal Shirts, and 180–240 GSM T-Shirts. Instant 2D preview with progressive bulk discounts.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/catalog"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-black shadow-xl shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start 2D Customizing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-300 shadow-xs transition-all"
                >
                  Browse Full Catalog
                </Link>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-orange-200/70 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl font-black text-slate-900 font-['Outfit']">300 DPI</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">DTF & Sublimation</p>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 font-['Outfit']">7+ Products</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tees, Mugs, Caps, Keychains</p>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 font-['Outfit']">100% Quality</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Bio-Washed & Inspected</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Product Preview */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-white p-4 shadow-2xl border border-slate-200 flex items-center justify-center overflow-hidden group">
                <img
                  src="https://res.cloudinary.com/d29f2ln4/image/upload/v1788107573/manavibeprints/mockups/white_T_shirt_zkwreq.jpg"
                  alt="Customizable Blank White T-Shirt"
                  className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Floating Studio Badge */}
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 shadow-xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready for 2D Canvas Print</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Category Navigator Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Printable Garment Categories</h2>
            <p className="text-xs text-slate-500 font-medium">Select a premium blank canvas tailored for digital heat press</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
            View All Blanks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat.name);
            const Icon = meta.icon;

            return (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-200 group text-center space-y-3 block"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-all duration-200 shadow-xs ${meta.bg}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {meta.badge}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Blank Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Popular Customizable Blanks</h2>
            <p className="text-xs text-slate-500 font-medium">100% bio-washed cotton, heavy terry hoodies & sublimation blanks</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
            View All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => {
              const mockup = product.featuredImageUrl || product.colors?.[0]?.mockups?.[0]?.mockupUrl;
              return (
                <div
                  key={product.id}
                  className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-orange-300 transition-all duration-200 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square bg-stone-100/60 p-4 flex items-center justify-center overflow-hidden">
                    {mockup ? (
                      <img
                        src={mockup}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Shirt className="w-16 h-16 text-slate-300" />
                    )}

                    {product.isCustomizable && (
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-orange-700 border border-orange-200 shadow-2xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-orange-600" /> 2D Studio
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {product.categoryName || 'Custom Merch'}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {/* Color Swatch Dots */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {product.colorHexCodes ? (
                          product.colorHexCodes.map((hex, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: hex }}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            />
                          ))
                        ) : (
                          product.colors?.map((c, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: c.hexCode }}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                              title={c.colorName}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting at</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-orange-600 font-['Outfit']">
                            ₹{product.basePrice}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            ₹{Math.round(product.basePrice * 1.25)}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={product.isCustomizable ? `/customize/${product.id}` : `/product/${product.id}`}
                        className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        {product.isCustomizable ? 'Customize' : 'Buy Now'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Interactive Bulk Tier Savings Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white p-8 md:p-12 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black">
                <Calculator className="w-3.5 h-3.5" />
                <span>Live Volume Savings Matrix</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
                Calculate Instant Bulk Savings for Your Fest or Brand
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you need 5 custom tees for your startup core team or 500+ for a college cultural fest, our automated volume pricing unlocks progressive studio discounts.
              </p>

              {/* Slider Input */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Order Quantity:</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{calculatorQty} Pieces</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={calculatorQty}
                  onChange={(e) => setCalculatorQty(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>1 Pc (Single)</span>
                  <span>20 Pcs (Team)</span>
                  <span>50 Pcs (Fest)</span>
                  <span>100+ Pcs (Wholesale)</span>
                </div>
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 space-y-6">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Discount Tier</span>
                    <p className="text-lg font-black text-white">{bulkEstimate.tier}</p>
                  </div>
                  {bulkEstimate.discountPct > 0 && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> {bulkEstimate.discountPct}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">Unit Price / Pc</span>
                    <span className="text-2xl font-black text-amber-400 font-['Outfit']">₹{bulkEstimate.unitPrice}</span>
                    <span className="text-[10px] text-slate-400 line-through ml-2">₹399</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">Total Estimated Cost</span>
                    <span className="text-2xl font-black text-emerald-400 font-['Outfit']">₹{totalBulkCost.toLocaleString()}</span>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
                    <span>🎉 Total Savings on this Batch:</span>
                    <span className="text-sm font-black font-mono">₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/catalog"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black text-center shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02]"
                  >
                    Start Customizing Batch
                  </Link>
                  <a
                    href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(`Hi ${settings.storeName || 'Mana Vibe Prints'}, I am looking for a bulk quote for ${calculatorQty} pieces.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center border border-white/20 transition-colors"
                  >
                    WhatsApp Studio Quote
                  </a>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              The 3-Step Custom Print Pipeline
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto mt-1">
              From creative canvas to high-res heat-cured perfection delivered to your doorstep
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-orange-50/50 border border-orange-100 space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-orange-500/25">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Choose Your Canvas</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Select from bio-washed T-Shirts, Formal Shirts, Ceramic Mugs, Caps, Keychains, or Custom DTF Prints.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/25">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Design in 2D Studio</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Upload artwork, review the live DPI clarity meter, customize text typography, and place graphics on front, back, or wrap positions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">DTF & Sublimation Press</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Our operators inspect the proof, print with 300 DPI Japanese pigments & heat sublimation, test wash durability, and dispatch fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Studio FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 font-medium">Everything you need to know about custom printing with Mana Vibe</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen[idx];
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
