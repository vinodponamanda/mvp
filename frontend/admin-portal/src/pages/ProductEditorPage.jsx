import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shirt, 
  Layers, 
  Palette, 
  Crop, 
  Tag, 
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import api from '../api/client';
import BasicDetailsTab from '../components/product-editor/BasicDetailsTab';
import MaterialsTab from '../components/product-editor/MaterialsTab';
import ColorsMockupsTab from '../components/product-editor/ColorsMockupsTab';
import PrintZonesTab from '../components/product-editor/PrintZonesTab';
import VolumeTiersTab from '../components/product-editor/VolumeTiersTab';

const TABS = [
  { id: 'basic', step: '1', label: 'Basic Info', icon: Shirt, desc: 'Name, SKU & Price' },
  { id: 'materials', step: '2', label: 'Materials & GSM', icon: Layers, desc: 'Fabric variations' },
  { id: 'colors', step: '3', label: 'Colors & Mockups', icon: Palette, desc: 'Hex & Blank photos' },
  { id: 'sizes', step: '4', label: 'Garment Sizes', icon: Tag, desc: 'S, M, L, XL sizes' },
  { id: 'zones', step: '5', label: 'Print Zones Studio', icon: Crop, desc: 'Visual Bounding Box' },
  { id: 'tiers', step: '6', label: 'Bulk Volume Tiers', icon: Sparkles, desc: 'Quantity discounts' },
];

export default function ProductEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Clean initial state with NO hardcoded dummy values
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    baseSku: '',
    basePrice: '',
    isCustomizable: true,
    isActive: true,
    materials: [],
    colors: [],
    sizes: [],
    printAreas: [],
    volumeTiers: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);

        if (isEditing) {
          const prodRes = await api.get(`/admin/products/${id}`);
          if (prodRes.data) {
            setProduct(prodRes.data);
          }
        } else if (catRes.data?.length > 0) {
          setProduct(prev => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load product editor data:', err);
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleBasicChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  // Sizing handlers
  const addSize = () => {
    const defaultLabels = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'Free Size'];
    const nextLabel = defaultLabels.find(l => !product.sizes.some(s => s.sizeLabel === l)) || 'Custom';
    setProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, { sizeLabel: nextLabel, priceAdjustment: 0, displayOrder: prev.sizes.length + 1 }]
    }));
  };

  const updateSize = (idx, field, value) => {
    const updated = [...product.sizes];
    updated[idx] = { ...updated[idx], [field]: value };
    setProduct(prev => ({ ...prev, sizes: updated }));
  };

  const removeSize = (idx) => {
    setProduct(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
  };

  // Next / Previous Tab Navigation
  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
  const goToNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (!product.name.trim()) {
      setError('Product name is required. Please fill Basic Info tab.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }

    if (!product.categoryId) {
      setError('Please select a product category in Basic Info tab.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }

    const numericPrice = parseFloat(product.basePrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Please enter a valid base retail price.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }

    const payload = {
      ...product,
      basePrice: numericPrice
    };

    try {
      if (isEditing) {
        await api.put(`/admin/products/${id}`, payload);
        setSuccessMessage('Product updated successfully! Redirecting...');
        setTimeout(() => navigate('/products'), 700);
      } else {
        await api.post('/admin/products', payload);
        setSuccessMessage('Product created successfully! Redirecting...');
        setTimeout(() => navigate('/products'), 700);
      }
    } catch (err) {
      console.error('Save product failed:', err);
      setError(err.response?.data?.message || 'Failed to save product matrix.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-['Outfit'] truncate">
              {isEditing ? `Edit: ${product.name || 'Product'}` : 'Create New Blank Garment / Merch'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-medium">
                {isEditing ? 'Configure print zones, mockup visuals & pricing tiers' : 'Step-by-step blank customizer builder'}
              </span>
              {product.basePrice !== '' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-black text-orange-600">
                    ₹{product.basePrice} Base
                  </span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {product.colors.length} Colors • {product.printAreas.length} Zones
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            to="/products"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Save Product Matrix' : 'Publish Blank Product'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" /> {successMessage}
        </div>
      )}

      {/* Modern Responsive Step Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25' 
                    : 'bg-slate-50 hover:bg-orange-50/60 text-slate-700 hover:text-orange-950 border border-slate-100 hover:border-orange-200'}
                `}
              >
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                  ${isActive ? 'bg-white/20 text-white' : 'bg-white text-orange-600 border border-slate-200'}
                `}>
                  {tab.step}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {tab.label}
                  </p>
                  <p className={`text-[10px] truncate hidden sm:block ${isActive ? 'text-orange-100' : 'text-slate-500'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel Body Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {activeTab === 'basic' && (
          <BasicDetailsTab
            product={product}
            categories={categories}
            onChange={handleBasicChange}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab
            materials={product.materials}
            onChange={(mats) => setProduct(prev => ({ ...prev, materials: mats }))}
          />
        )}

        {activeTab === 'colors' && (
          <ColorsMockupsTab
            colors={product.colors}
            onChange={(cols) => setProduct(prev => ({ ...prev, colors: cols }))}
          />
        )}

        {activeTab === 'sizes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Garment Sizing Options</h3>
                <p className="text-xs text-slate-500 font-medium">Manage size labels (S, M, L, XL, 2XL) and plus-size surcharges (e.g. +₹50 for 2XL)</p>
              </div>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm"
              >
                + Add Size
              </button>
            </div>

            {product.sizes.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                <p className="text-sm font-semibold">No sizes added yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "+ Add Size" to add S, M, L, XL, Free Size, etc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {product.sizes.map((size, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Size Label</label>
                      <input
                        type="text"
                        value={size.sizeLabel}
                        onChange={(e) => updateSize(idx, 'sizeLabel', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Extra (+₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={size.priceAdjustment}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                        onChange={(e) => updateSize(idx, 'priceAdjustment', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 self-end mb-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'zones' && (
          <PrintZonesTab
            printAreas={product.printAreas}
            colors={product.colors}
            onChange={(zones) => setProduct(prev => ({ ...prev, printAreas: zones }))}
          />
        )}

        {activeTab === 'tiers' && (
          <VolumeTiersTab
            volumeTiers={product.volumeTiers}
            basePrice={parseFloat(product.basePrice) || 0}
            onChange={(tiers) => setProduct(prev => ({ ...prev, volumeTiers: tiers }))}
          />
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentTabIndex > 0 ? (
            <button
              type="button"
              onClick={goToPrevTab}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous: {TABS[currentTabIndex - 1].label}
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {currentTabIndex < TABS.length - 1 ? (
              <button
                type="button"
                onClick={goToNextTab}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
              >
                Next: {TABS[currentTabIndex + 1].label} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isEditing ? 'Save All Changes' : 'Complete & Publish Blank'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
