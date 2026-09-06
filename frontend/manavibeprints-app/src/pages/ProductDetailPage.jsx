import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Shirt, 
  Loader2, 
  Check,
  TrendingDown,
  Layers,
  Award,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import ColorSwatchPicker from '../components/customizer/ColorSwatchPicker';
import MaterialSizeSelector from '../components/customizer/MaterialSizeSelector';
import DeliveryChecker from '../components/cart/DeliveryChecker';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { settings } = useStore();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const cleanWhatsAppPhone = (settings.whatsApp || settings.phone || '').replace(/\D/g, '') || '919876543210';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'bulk', 'delivery'
  const [activeMockupIndex, setActiveMockupIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data.materials?.length > 0) setSelectedMaterial(data.materials.find(m => m.isDefault) || data.materials[0]);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Reset active mockup index when color selection changes
  useEffect(() => {
    setActiveMockupIndex(0);
    setIsZoomed(false);
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-base font-bold text-slate-700">Product not found</p>
        <Link to="/catalog" className="text-xs text-orange-600 font-bold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const mockups = (selectedColor?.mockups && selectedColor.mockups.length > 0)
    ? selectedColor.mockups.filter(m => m.mockupUrl)
    : (product.featuredImageUrl ? [{ mockupUrl: product.featuredImageUrl, position: 'Front' }] : []);

  const currentMockup = mockups[activeMockupIndex] || mockups[0];
  const activeMockupUrl = currentMockup?.mockupUrl;
  const activeMockupPosition = currentMockup?.position || 'Front';

  const handlePrevMockup = (e) => {
    e?.stopPropagation();
    setActiveMockupIndex(prev => (prev === 0 ? mockups.length - 1 : prev - 1));
  };

  const handleNextMockup = (e) => {
    e?.stopPropagation();
    setActiveMockupIndex(prev => (prev === mockups.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const fabricAdjustment = selectedMaterial?.priceAdjustment || 0;
  const sizeAdjustment = selectedSize?.priceAdjustment || 0;
  const basePrice = product.basePrice + fabricAdjustment + sizeAdjustment;

  // Dynamic Volume Pricing Tiers configured by Admin in Admin Portal
  const configuredTiers = (product.volumeTiers || [])
    .slice()
    .sort((a, b) => a.minQuantity - b.minQuantity);

  const bestTier = configuredTiers.length > 0 ? configuredTiers[configuredTiers.length - 1] : null;
  const bestTierPrice = bestTier ? (bestTier.unitPrice + fabricAdjustment + sizeAdjustment) : null;

  // Direct Buy Now / Add to Cart handler (for non-customizable products)
  const handleAddToCart = () => {
    let activeUnitPrice = basePrice;
    if (configuredTiers.length > 0) {
      const matchedTier = configuredTiers.find(
        (t) => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
      );
      if (matchedTier) {
        activeUnitPrice = matchedTier.unitPrice + fabricAdjustment + sizeAdjustment;
      }
    }

    addItem({
      productId: product.id,
      productName: product.name,
      colorName: selectedColor?.colorName || 'Default',
      sizeLabel: selectedSize?.sizeLabel || 'Standard',
      materialName: selectedMaterial?.materialName || '',
      fabricAdjustment,
      sizeAdjustment,
      volumeTiers: product.volumeTiers || [],
      quantity,
      unitPrice: activeUnitPrice,
      totalPrice: activeUnitPrice * quantity,
      previewMockupUrl: activeMockupUrl,
      customizations: []
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Product Mockup Photo Stage with Carousel & Hover Zoom */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex items-center justify-center relative aspect-square overflow-hidden cursor-crosshair group select-none"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {activeMockupUrl ? (
              <img
                src={activeMockupUrl}
                alt={`${product.name} - ${activeMockupPosition}`}
                className="w-full h-full object-contain transition-transform duration-150 ease-out pointer-events-none"
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                }}
              />
            ) : (
              <Shirt className="w-24 h-24 text-slate-300" />
            )}

            {product.isCustomizable && (
              <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 z-10 pointer-events-none">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2D Customizer Studio</span>
              </div>
            )}

            {/* Position View Badge */}
            {activeMockupPosition && mockups.length > 1 && (
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold z-10 pointer-events-none">
                {activeMockupPosition.replace('_', ' ')} View
              </div>
            )}

            {/* Carousel Arrow Navigation Buttons */}
            {mockups.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMockup}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 z-20 cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMockup}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 z-20 cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Hover Zoom Indicator & Spec Tag */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-slate-700 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 pointer-events-none z-10">
              <ZoomIn className="w-3 h-3 text-orange-600" />
              <span>{isZoomed ? 'Zoom Active' : 'Hover to Zoom'}</span>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 text-white px-3 py-1 rounded-xl text-[11px] font-bold shadow-xs pointer-events-none z-10">
              300 DPI Industrial Spec
            </div>
          </div>

          {/* Multi-angle Thumbnail Strip */}
          {mockups.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
              {mockups.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveMockupIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative w-16 h-16 rounded-2xl bg-white border p-1 shrink-0 transition-all cursor-pointer ${
                    activeMockupIndex === idx 
                      ? 'border-orange-600 ring-2 ring-orange-500/30 shadow-md scale-105' 
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={m.mockupUrl}
                    alt={m.position || `View ${idx + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-2xs whitespace-nowrap">
                    {(m.position || 'View').replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Quality Tags */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
              <span className="text-xs font-black text-orange-950 block">100% Cotton</span>
              <span className="text-[10px] text-orange-700 font-semibold">Combed & Bio-Washed</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs font-black text-amber-950 block">50+ Washes</span>
              <span className="text-[10px] text-amber-700 font-semibold">Zero Print Cracking</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-black text-emerald-950 block">24-48h Dispatch</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Fast Studio Turnaround</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Tier Matrix & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              {product.categoryName || 'Custom Merch'}
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
              {product.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">SKU: {product.baseSku || 'MVP-BLANK'}</p>
          </div>

          {/* Single Piece vs Bulk Pricing Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Single Unit Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-600 font-['Outfit']">
                  ₹{basePrice}
                </span>
                <span className="text-sm text-slate-400 line-through font-semibold">
                  ₹{Math.round(basePrice * 1.25)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Volume Bulk Rate</span>
              {bestTier ? (
                <>
                  <span className="text-xl font-black text-slate-900 font-['Outfit']">
                    From ₹{bestTierPrice}/pc
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    on {bestTier.maxQuantity ? `${bestTier.minQuantity}–${bestTier.maxQuantity}` : `${bestTier.minQuantity}+`} pieces
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-800 font-['Outfit']">
                    Custom Bulk Rates
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Inquire on WhatsApp</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {product.description || 'Premium heavyweight garment engineered specifically for digital Direct-to-Film (DTF) heat-press transfers and screen print applications.'}
          </p>

          {/* Colorways Picker */}
          <ColorSwatchPicker
            colors={product.colors}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />

          {/* Fabrics & Sizes */}
          <MaterialSizeSelector
            materials={product.materials}
            selectedMaterial={selectedMaterial}
            onSelectMaterial={setSelectedMaterial}
            sizes={product.sizes}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
          />

          {/* Volume Tier Table - Rendered dynamically from Admin Portal settings */}
          {configuredTiers.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic Volume Pricing Tiers:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {/* Standard Retail Tier if first tier starts > 1 */}
                {configuredTiers[0].minQuantity > 1 && (
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      1–{configuredTiers[0].minQuantity - 1} pcs
                    </span>
                    <span className="font-black text-slate-900 font-mono text-sm">₹{basePrice}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">Standard</span>
                  </div>
                )}

                {/* Admin Configured Tiers */}
                {configuredTiers.map((tier, idx) => {
                  const tierPrice = tier.unitPrice + fabricAdjustment + sizeAdjustment;
                  const discountPercent = tier.discountPercentage > 0
                    ? tier.discountPercentage
                    : (product.basePrice > 0 && tier.unitPrice < product.basePrice
                        ? Math.round(((product.basePrice - tier.unitPrice) / product.basePrice) * 100)
                        : 0);

                  const themeColors = [
                    'bg-orange-50 border-orange-200 text-orange-800 text-orange-700 text-orange-600',
                    'bg-amber-50 border-amber-200 text-amber-800 text-amber-700 text-amber-600',
                    'bg-emerald-50 border-emerald-200 text-emerald-800 text-emerald-700 text-emerald-600',
                    'bg-sky-50 border-sky-200 text-sky-800 text-sky-700 text-sky-600',
                    'bg-purple-50 border-purple-200 text-purple-800 text-purple-700 text-purple-600'
                  ];
                  const chosenTheme = themeColors[idx % themeColors.length].split(' ');

                  return (
                    <div
                      key={tier.id || idx}
                      className={`p-2.5 rounded-xl border ${chosenTheme[0]} ${chosenTheme[1]}`}
                    >
                      <span className={`text-[10px] font-bold block ${chosenTheme[3]}`}>
                        {tier.maxQuantity ? `${tier.minQuantity}–${tier.maxQuantity} pcs` : `${tier.minQuantity}+ pcs`}
                      </span>
                      <span className={`font-black font-mono text-sm ${chosenTheme[2]}`}>
                        ₹{tierPrice}
                      </span>
                      {discountPercent > 0 ? (
                        <span className={`text-[9px] block font-bold ${chosenTheme[4]}`}>
                          -{discountPercent}%
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block font-medium">Tier Price</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {product.isCustomizable ? (
              <button
                type="button"
                onClick={() => navigate(`/customize/${product.id}`)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open 2D Canvas Designer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Add to Cart (Direct Buy)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Direct WhatsApp Bulk Quote Link */}
            <a
              href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(`Hi ${settings.storeName || 'Mana Vibe Prints'}, I am interested in custom printing for ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inquire for Custom Bulk Fest Order on WhatsApp</span>
            </a>
          </div>

          {/* Interactive Information Tabs */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`pb-2 transition-colors ${activeTab === 'specs' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Technical Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className={`pb-2 transition-colors ${activeTab === 'delivery' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Check Delivery Radius
              </button>
            </div>

            {activeTab === 'specs' && (
              <div className="space-y-2 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-bold block">Fabric Weight:</span>
                    <span className="font-semibold text-slate-800">{selectedMaterial?.materialName || '180 GSM Bio-Washed Cotton'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Print Technology:</span>
                    <span className="font-semibold text-slate-800">Direct-to-Film (300 DPI)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Weave & Finish:</span>
                    <span className="font-semibold text-slate-800">Super Combed Ring-Spun</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Wash Care:</span>
                    <span className="font-semibold text-slate-800">Machine wash cold inside-out</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <DeliveryChecker />
            )}
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Quality Inspected</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>Insured Doorstep Dispatch</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
