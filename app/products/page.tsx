'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProductCard from '@/components/products/ProductCard';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  slug: string;
  images?: string[];
  price: number;
  original_price?: number;
  description?: string;
  category_id?: number;
  category?: { id: number; name: string; slug: string };
  is_featured?: boolean;
  in_stock?: boolean;
  secure_url?: string;
  dimensions?: string;
  materials?: string;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PlacedItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// ────────────────────────────────────────────────────────────────────────────
// ROOM PLANNER MODAL
// ────────────────────────────────────────────────────────────────────────────

function RoomPlanner({
  products, isOpen, onClose,
}: {
  products: Array<{ id: number; name: string; images: string[]; price: number }>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const roomUploadRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleRoomImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      setRoomImage(event.target?.result as string);
      setPlacedItems([]); setSelectedItemId(null);
      toast.success('Room photo uploaded!');
    };
    reader.readAsDataURL(file);
  }

  function handleAddFurniture() {
    if (!selectedProduct || !roomImage) { toast.error('Select a product and upload a room photo first'); return; }
    setPlacedItems([...placedItems, {
      id: `item-${Date.now()}`, productId: selectedProduct.id,
      productName: selectedProduct.name, productImage: selectedProduct.images[0],
      x: 50, y: 50, width: 120, height: 120, rotation: 0,
    }]);
    toast.success(`${selectedProduct.name} added to room!`);
  }

  function handleRemoveItem(id: string) {
    setPlacedItems(placedItems.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  }

  function handleMouseDown(e: React.MouseEvent, itemId: string) {
    if ((e.target as HTMLElement).closest('[data-ignore-drag]')) return;
    setSelectedItemId(itemId); setIsDragging(true);
    const item = placedItems.find(i => i.id === itemId);
    if (item && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left - item.x, y: e.clientY - rect.top - item.y });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !selectedItemId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 100));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100));
    setPlacedItems(placedItems.map(i => i.id === selectedItemId ? { ...i, x: newX, y: newY } : i));
  }

  function updateItem(id: string, updates: Partial<PlacedItem>) {
    setPlacedItems(placedItems.map(i => i.id === id ? { ...i, ...updates } : i));
  }

  function handleShareWhatsApp() {
    if (placedItems.length === 0) { toast.error('Add furniture to your room plan first'); return; }
    const itemsList = placedItems
      .map(i => `• ${i.productName} (KES ${products.find(p => p.id === i.productId)?.price.toLocaleString() || 'N/A'})`)
      .join('%0A');
    window.open(`https://wa.me/254115990547?text=Hi! I'd like to discuss this room design:%0A%0A${itemsList}%0A%0ACan you help me with this?`, '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="font-serif text-2xl font-bold">Virtual Room Planner</h2>
            <p className="text-sm text-gray-500 mt-1">Upload your room photo and visualize furniture in your space</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
                <h3 className="font-semibold text-sm mb-3 text-primary-900">Step 1: Upload Room</h3>
                <div className="border-2 border-dashed border-primary-300 rounded-lg p-3 text-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => roomUploadRef.current?.click()}>
                  <svg className="w-5 h-5 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs font-medium text-primary-700">{roomImage ? 'Change Photo' : 'Upload Photo'}</p>
                </div>
                <input ref={roomUploadRef} type="file" accept="image/*" className="hidden" onChange={handleRoomImageUpload} />
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-sm mb-3 text-blue-900">Step 2: Select Furniture</h3>
                <select value={selectedProduct?.id || ''} onChange={e => setSelectedProduct(products.find(p => p.id === Number(e.target.value)) || null)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Choose a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — KES {p.price.toLocaleString()}</option>)}
                </select>
                <button onClick={handleAddFurniture} className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Add to Room</button>
              </div>
              {placedItems.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-sm mb-3">Items in Room ({placedItems.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {placedItems.map(item => (
                      <div key={item.id} onClick={() => setSelectedItemId(item.id)}
                        className={`p-2 rounded-lg cursor-pointer text-xs transition-all ${selectedItemId === item.id ? 'bg-primary-100 border border-primary-300' : 'bg-white border border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-2">
                          <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-700 line-clamp-1">{item.productName}</p>
                            <p className="text-gray-500 text-xs">KES {products.find(p => p.id === item.productId)?.price.toLocaleString()}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); handleRemoveItem(item.id); }} className="text-red-500 hover:text-red-700 font-bold">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedItemId && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h3 className="font-semibold text-sm mb-3 text-yellow-900">Adjust Item</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Size</label>
                      <input type="range" min="50" max="250" value={placedItems.find(i => i.id === selectedItemId)?.width || 120}
                        onChange={e => updateItem(selectedItemId, { width: Number(e.target.value), height: Number(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Rotation</label>
                      <input type="range" min="0" max="360" value={placedItems.find(i => i.id === selectedItemId)?.rotation || 0}
                        onChange={e => updateItem(selectedItemId, { rotation: Number(e.target.value) })} className="w-full" />
                    </div>
                  </div>
                </div>
              )}
              {placedItems.length > 0 && (
                <button onClick={handleShareWhatsApp} className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.969 1.523A9.865 9.865 0 005.064 9.51a9.87 9.87 0 001.523 4.969 9.865 9.865 0 004.969 1.524h.004c2.648 0 5.195-1.035 7.081-2.92a10.01 10.01 0 002.919-7.081 9.87 9.87 0 00-1.523-4.969A9.865 9.865 0 0012 2.05A9.87 9.87 0 007.05 3.574 9.865 9.865 0 005.13 8.544m11.313-5.867A11.9 11.9 0 0012 1c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 19.627 0 12 5.373 0 12 0z" />
                  </svg>
                  Share on WhatsApp
                </button>
              )}
            </div>
            <div className="lg:col-span-3">
              {roomImage ? (
                <div ref={canvasRef} className="relative w-full h-96 lg:h-full bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 cursor-move"
                  onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
                  <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
                  {placedItems.map(item => (
                    <div key={item.id} onMouseDown={e => handleMouseDown(e, item.id)}
                      className={`absolute transition-all ${selectedItemId === item.id ? 'ring-2 ring-primary-400 shadow-lg' : 'hover:ring-1 hover:ring-gray-400'}`}
                      style={{ left: `${item.x}px`, top: `${item.y}px`, width: `${item.width}px`, height: `${item.height}px`, transform: `rotate(${item.rotation}deg)`, cursor: isDragging && selectedItemId === item.id ? 'grabbing' : 'grab' }}>
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg shadow-md" />
                      {selectedItemId === item.id && (
                        <div className="absolute -top-8 left-0 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap" data-ignore-drag>{item.productName}</div>
                      )}
                    </div>
                  ))}
                  {placedItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <p className="text-white text-center">
                        <span className="block text-sm mb-2">👈 Add furniture from the left panel</span>
                        <span className="text-xs opacity-75">Drag to move • Use controls to resize & rotate</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 lg:h-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">Upload a room photo to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">Close</button>
          {placedItems.length > 0 && (
            <button onClick={handleShareWhatsApp} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">Share Plan on WhatsApp</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PRODUCTS PAGE INNER
// ────────────────────────────────────────────────────────────────────────────

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoomPlanner, setShowRoomPlanner] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${backendUrl}/api/v1/categories/`)
      .then(r => r.ok ? r.json() : [])
      .then((cats: Category[]) => setCategories(cats))
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${backendUrl}/api/v1/products/?limit=100`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Product[]) => {
        // Normalise: attach category object if only category_id present
        setProducts(data);
      })
      .catch(() => toast.error('Could not load products'))
      .finally(() => setLoading(false));
  }, []);

  // Sync category filter from URL param
  useEffect(() => {
    const slug = searchParams.get('category');
    if (slug) {
      const cat = categories.find(c => c.slug === slug);
      setSelectedCategory(cat ? String(cat.id) : null);
    }
  }, [searchParams, categories]);

  // Filter products
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) filtered = filtered.filter(p => String(p.category_id) === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // Build a product object compatible with ProductCard (attach category obj)
  function toCardProduct(p: Product) {
    const cat = categories.find(c => c.id === p.category_id);
    return {
      ...p,
      images: p.images?.length ? p.images : (p.secure_url ? [p.secure_url] : []),
      category: cat ? cat : p.category,
    };
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-secondary-400 text-xs uppercase tracking-widest mb-2">New Face Furniture</p>
          <h1 className="font-serif text-4xl font-bold mb-2">Our Collection</h1>
          <p className="text-gray-400 text-sm">Discover luxury furniture for your home, office, or business.</p>
        </div>
      </div>

      <RoomPlanner
        products={products.map(p => ({
          id: p.id, name: p.name,
          images: p.images?.length ? p.images : (p.secure_url ? [p.secure_url] : ['/placeholder-furniture.jpg']),
          price: p.price,
        }))}
        isOpen={showRoomPlanner}
        onClose={() => setShowRoomPlanner(false)}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Room Planner + Search + Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
          <button
            onClick={() => setShowRoomPlanner(true)}
            className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Room Planner
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === null ? 'bg-dark text-white border-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === String(cat.id) ? 'bg-dark text-white border-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 mb-5">
            {filteredProducts.length} of {products.length} products
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
              <p className="text-gray-400 text-sm">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10" />
            </svg>
            <h3 className="text-base font-semibold text-gray-600 mb-1">No products found</h3>
            <p className="text-gray-400 text-sm">Try a different category or search term.</p>
          </div>
        ) : (
          // ── Use ProductCard — gives ratings, save amount, add-to-cart, click-through ──
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={toCardProduct(product) as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORT — Suspense required by Next.js 15 for useSearchParams
// ────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}