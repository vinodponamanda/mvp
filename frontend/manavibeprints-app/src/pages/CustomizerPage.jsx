import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Type, 
  Palette, 
  Layers, 
  RotateCcw, 
  Loader2, 
  ShoppingBag, 
  CheckCircle2,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import FabricCanvasStage from '../components/customizer/FabricCanvasStage';
import ArtworkUploader from '../components/customizer/ArtworkUploader';
import TextDrawer from '../components/customizer/TextDrawer';
import PlacementSideBar from '../components/customizer/PlacementSideBar';
import ColorSwatchPicker from '../components/customizer/ColorSwatchPicker';
import MaterialSizeSelector from '../components/customizer/MaterialSizeSelector';
import LivePricingSummary from '../components/customizer/LivePricingSummary';

const DESIGNER_TABS = [
  { id: 'upload', label: 'Upload Artwork', icon: Upload },
  { id: 'text', label: 'Custom Text', icon: Type },
  { id: 'color', label: 'Garment Color', icon: Palette },
  { id: 'fabric', label: 'Fabric & Size', icon: Layers },
];

export default function CustomizerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const canvasRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  
  // Customization Configuration State
  const [activeSide, setActiveSide] = useState('Front');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentDpi, setCurrentDpi] = useState(null);
  const [activeObject, setActiveObject] = useState(null);

  // Multi-side saved designs state dictionary: { Front: { artworkUrl, naturalWidth, dpi, designJson, proofUrl } }
  const [designsPerSide, setDesignsPerSide] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);

        // Initial setup
        if (data.printAreas?.length > 0) {
          setActiveSide(data.printAreas[0].positionName);
        }
        if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        if (data.materials?.length > 0) {
          setSelectedMaterial(data.materials.find(m => m.isDefault) || data.materials[0]);
        }
        if (data.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error('Failed to load customizer product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-36">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-base font-bold text-slate-700">Product blank not found</p>
        <Link to="/catalog" className="text-xs text-orange-600 font-bold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Active Zone Coordinates & Details
  const activeZone = product.printAreas?.find(p => p.positionName === activeSide) || product.printAreas?.[0] || null;

  // Find active mockup photo for selected color and side
  const activeMockupUrl = 
    selectedColor?.mockups?.find(m => m.position === activeSide)?.mockupUrl ||
    selectedColor?.mockups?.[0]?.mockupUrl ||
    product.colors?.[0]?.mockups?.[0]?.mockupUrl || '';

  // Calculate Extra Surcharges for multiple customized sides
  const customizedSidesList = Object.keys(designsPerSide);
  const extraSidesCost = product.printAreas
    ?.filter(p => customizedSidesList.includes(p.positionName))
    .reduce((sum, p) => sum + (p.extraCost || 0), 0);

  // Switch Side handler: save current canvas proof before switching
  const handleSelectSide = (newSide) => {
    if (newSide === activeSide) return;

    if (canvasRef.current) {
      const proof = canvasRef.current.exportCompositeProof();
      const json = canvasRef.current.exportDesignJson();

      setDesignsPerSide(prev => {
        const updated = {
          ...prev,
          [activeSide]: {
            ...prev[activeSide],
            proofUrl: proof,
            designJson: json,
            dpi: currentDpi
          }
        };

        // Clear canvas and restore new side's saved design if present
        canvasRef.current.clearCanvas();
        if (updated[newSide]?.designJson) {
          canvasRef.current.loadDesignJson(updated[newSide].designJson);
        }

        return updated;
      });
    }

    setActiveSide(newSide);
    setCurrentDpi(designsPerSide[newSide]?.dpi || null);
  };

  // Add Graphic Handler
  const handleAddArtwork = (url, naturalWidth, naturalHeight) => {
    if (canvasRef.current) {
      canvasRef.current.addImage(url, naturalWidth);
      setDesignsPerSide(prev => ({
        ...prev,
        [activeSide]: {
          ...prev[activeSide],
          artworkUrl: url,
          naturalWidth,
          naturalHeight
        }
      }));
    }
  };

  // Add Text Handler
  const handleAddText = (text, options) => {
    if (canvasRef.current) {
      canvasRef.current.addText(text, options);
      setDesignsPerSide(prev => ({
        ...prev,
        [activeSide]: {
          ...prev[activeSide],
          hasText: true
        }
      }));
    }
  };

  // Add to Cart Final Assembly
  const handleAddToCart = () => {
    // Generate proof for current side
    const currentProof = canvasRef.current?.exportCompositeProof() || activeMockupUrl;
    
    // Assemble multi-side customizations payload
    const customizationsPayload = Object.entries(designsPerSide).map(([pos, data]) => {
      const zoneSpec = product.printAreas?.find(p => p.positionName === pos);
      return {
        position: pos,
        originalArtworkUrl: data.artworkUrl || '',
        compositeMockupUrl: data.proofUrl || currentProof,
        designJson: data.designJson || '',
        selectedPrintMethod: zoneSpec?.supportedPrintMethods?.[0] || 'DTF',
        estimatedDpi: data.dpi || 300,
        physicalWidthInches: zoneSpec?.physicalWidthInches || 10,
        physicalHeightInches: zoneSpec?.physicalHeightInches || 12,
        extraSideCost: zoneSpec?.extraCost || 0
      };
    });

    // If no explicit upload made yet, bundle current view
    if (customizationsPayload.length === 0) {
      customizationsPayload.push({
        position: activeSide,
        originalArtworkUrl: '',
        compositeMockupUrl: currentProof,
        designJson: canvasRef.current?.exportDesignJson() || '',
        selectedPrintMethod: activeZone?.supportedPrintMethods?.[0] || 'DTF',
        estimatedDpi: 300,
        physicalWidthInches: activeZone?.physicalWidthInches || 10,
        physicalHeightInches: activeZone?.physicalHeightInches || 12,
        extraSideCost: 0
      });
    }

    // Match volume tier
    let unitBasePrice = product.basePrice;
    if (product.volumeTiers?.length > 0) {
      const tier = product.volumeTiers.find(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity));
      if (tier) unitBasePrice = tier.unitPrice;
    }

    const finalUnitPrice = unitBasePrice + (selectedMaterial?.priceAdjustment || 0) + (selectedSize?.priceAdjustment || 0) + extraSidesCost;

    addItem({
      productId: product.id,
      productName: product.name,
      colorName: selectedColor?.colorName || 'Default',
      sizeLabel: selectedSize?.sizeLabel || 'Free Size',
      materialName: selectedMaterial?.materialName || '',
      fabricAdjustment: selectedMaterial?.priceAdjustment || 0,
      sizeAdjustment: selectedSize?.priceAdjustment || 0,
      extraSidesCost,
      volumeTiers: product.volumeTiers || [],
      quantity,
      unitPrice: finalUnitPrice,
      totalPrice: finalUnitPrice * quantity,
      previewMockupUrl: currentProof,
      customizations: customizationsPayload
    });
  };

  return (
    <div className="min-h-screen bg-stone-50/60 pb-16">
      
      {/* Studio Header Bar */}
      <header className="h-16 sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900 font-['Outfit'] truncate">
              {product.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Interactive 2D Designer Studio • 300 DPI Ultra-HD
            </p>
          </div>
        </div>

        {/* Multi-Side Switcher */}
        <PlacementSideBar
          printAreas={product.printAreas}
          activeSide={activeSide}
          onSelectSide={handleSelectSide}
          customizedSides={designsPerSide}
        />

        {/* Clear / Reset Action */}
        <button
          type="button"
          onClick={() => canvasRef.current?.clearCanvas()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors"
          title="Clear canvas layers"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </header>

      {/* Main Studio Workspace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Creative Design Tools Drawer (Tabs: Upload, Text, Color, Fabric) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tool Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
              {DESIGNER_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex flex-col items-center justify-center p-2.5 rounded-xl text-[11px] font-bold transition-all
                      ${isActive 
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25' 
                        : 'text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tool Panel */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              {activeTab === 'upload' && (
                <ArtworkUploader
                  onAddArtwork={handleAddArtwork}
                  currentDpi={currentDpi}
                  activeZone={activeZone}
                />
              )}

              {activeTab === 'text' && (
                <TextDrawer
                  onAddText={handleAddText}
                  onUpdateActiveObject={(prop, val) => canvasRef.current?.updateActiveObject(prop, val)}
                  activeObject={activeObject}
                />
              )}

              {activeTab === 'color' && (
                <ColorSwatchPicker
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                />
              )}

              {activeTab === 'fabric' && (
                <MaterialSizeSelector
                  materials={product.materials}
                  selectedMaterial={selectedMaterial}
                  onSelectMaterial={setSelectedMaterial}
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
              )}
            </div>
          </div>

          {/* Center Column: Fabric.js Interactive 2D Canvas Stage */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <FabricCanvasStage
              ref={canvasRef}
              mockupUrl={activeMockupUrl}
              activeZone={activeZone}
              onObjectSelected={setActiveObject}
              onDpiCalculated={setCurrentDpi}
            />
          </div>

          {/* Right Column: Live Volume Pricing & Add to Cart Engine */}
          <div className="lg:col-span-3 space-y-4">
            <LivePricingSummary
              basePrice={product.basePrice}
              volumeTiers={product.volumeTiers}
              quantity={quantity}
              onQuantityChange={setQuantity}
              materialAdjustment={selectedMaterial?.priceAdjustment || 0}
              sizeAdjustment={selectedSize?.priceAdjustment || 0}
              extraSidesCost={extraSidesCost}
              onAddToCart={handleAddToCart}
            />
          </div>

        </div>
      </div>

    </div>
  );
}
