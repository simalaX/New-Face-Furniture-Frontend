'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import RoomPlanner from '@/components/home/RoomPlanner';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  images?: string[];
  price: number;
  original_price?: number;
  description?: string;
  category_id?: number;
  is_featured?: boolean;
  in_stock?: boolean;
  secure_url?: string;
  dimensions?: string;
  materials?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoomPlanner, setShowRoomPlanner] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://new-face-backend-ba3q.onrender.com';

  // ── Load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/categories/`);
        const cats: Category[] = await res.json();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // ── Load products ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/v1/products/?limit=100`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Could not load products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ── Handle category filter from URL ────────────────────────────────────────
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      setSelectedCategory(cat ? String(cat.id) : null);
    }
  }, [searchParams, categories]);

  // ── Filter products ────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(p => String(p.category_id) === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Room Planner Modal */}
      <RoomPlanner
        products={products.map(p => ({
          id: p.id,
          name: p.name,
          images: p.images || (p.secure_url ? [p.secure_url] : []),
          price: p.price,
        }))}
        isOpen={showRoomPlanner}
        onClose={() => setShowRoomPlanner(false)}
      />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-3">Our Collection</h1>
          <p className="text-gray-600">Discover our curated selection of luxury furniture for your home, office, or business.</p>
        </div>

        {/* Virtual Room Planner Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowRoomPlanner(true)}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Virtual Room Planner
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === String(cat.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const imageUrl = product.images?.[0] || product.secure_url || '';
              const discount = product.original_price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{discount}%
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold">
                        Featured
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-bold text-primary-600">
                        KES {product.price.toLocaleString()}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          KES {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      {product.dimensions && <p>📐 {product.dimensions}</p>}
                      {product.materials && <p>🪵 {product.materials}</p>}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {product.in_stock === false ? (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <a
                      href={`https://wa.me/254115990547?text=Hi! I'm interested in the ${encodeURIComponent(product.name)} (KES ${product.price.toLocaleString()}). Can you provide more details?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.969 1.523A9.865 9.865 0 005.064 9.51a9.87 9.87 0 001.523 4.969 9.865 9.865 0 004.969 1.524h.004c2.648 0 5.195-1.035 7.081-2.92a10.01 10.01 0 002.919-7.081 9.87 9.87 0 00-1.523-4.969A9.865 9.865 0 0012 2.05A9.87 9.87 0 007.05 3.574 9.865 9.865 0 005.13 8.544m11.313-5.867A11.9 11.9 0 0012 1c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 19.627 0 12 5.373 0 12 0z" />
                      </svg>
                      Inquire
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}