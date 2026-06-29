'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A-Z' },
];

const PRICE_RANGES = [
  { label: 'Any Price', value: '' },
  { label: 'Under KES 20K', value: '0-20000' },
  { label: 'KES 20K - 50K', value: '20000-50000' },
  { label: 'KES 50K - 100K', value: '50000-100000' },
  { label: 'KES 100K - 200K', value: '100000-200000' },
  { label: 'Above KES 200K', value: '200000-999999999' },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Sofas & Seating', slug: 'sofas-seating' },
  { id: 2, name: 'Beds & Bedroom', slug: 'beds-bedroom' },
  { id: 3, name: 'Dining Sets', slug: 'dining-sets' },
  { id: 4, name: 'Coffee Tables', slug: 'coffee-tables' },
  { id: 5, name: 'TV Stands', slug: 'tv-stands' },
  { id: 6, name: 'Wardrobes', slug: 'wardrobes' },
  { id: 7, name: 'Office Furniture', slug: 'office-furniture' },
  { id: 8, name: 'Accent Chairs', slug: 'accent-chairs' },
  { id: 9, name: 'Outdoor Furniture', slug: 'outdoor-furniture' },
  { id: 10, name: 'Storage Solutions', slug: 'storage-solutions' },
  { id: 11, name: 'Hotel & Restaurant', slug: 'hotel-restaurant' },
  { id: 12, name: 'Airbnb Furnishing', slug: 'airbnb-furnishing' },
  { id: 13, name: 'Lounges', slug: 'lounges' },
  { id: 14, name: 'Bar Stools', slug: 'bar-stools' },
  { id: 15, name: 'Custom', slug: 'custom' },
];

function ProductsContent() {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const priceParam = searchParams.get('price') || '';
  const sortParam = searchParams.get('sort') || 'default';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [search] = useState(searchParam);
  const [selectedCat, setSelectedCat] = useState(categoryParam);
  const [sort, setSort] = useState(sortParam);
  const [priceRange, setPriceRange] = useState(priceParam);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setSelectedCat(categoryParam); }, [categoryParam]);
  useEffect(() => { setPriceRange(priceParam); }, [priceParam]);
  useEffect(() => { setSort(sortParam); }, [sortParam]);

  useEffect(() => {
    setLoading(true);
    productsApi.getAll({ limit: 50 })
      .then(d => { if (d?.length) setProducts(d); })
      .catch(() => { })
      .finally(() => setLoading(false));

    categoriesApi.getAll()
      .then(d => { if (d?.length) setCategories(d); })
      .catch(() => { });
  }, []);

  const allCats = [{ id: 0, name: 'All Products', slug: 'all' }, ...categories];

  const [priceMin, priceMax] = priceRange
    ? priceRange.split('-').map(Number)
    : [0, Infinity];

  const filtered = products
    .filter(p => selectedCat === 'all' || p.category?.slug === selectedCat)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (!priceRange) return true;
      return p.price >= priceMin && p.price <= priceMax;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const currentCatName = allCats.find(c => c.slug === selectedCat)?.name || 'All Products';
  const hasActiveFilters = selectedCat !== 'all' || priceRange || sort !== 'default';

  function clearAll() {
    setSelectedCat('all');
    setPriceRange('');
    setSort('default');
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-2">Our Collection</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">{currentCatName}</h1>
          <p className="text-gray-400 mt-3">Premium furniture crafted for every space in Kenya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm font-medium">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {hasActiveFilters && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">Clear filters</button>
            )}
            <select value={sort} onChange={e => setSort(e.target.value)} className="input bg-white w-52">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCat !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full border border-primary-100">
                {allCats.find(c => c.slug === selectedCat)?.name}
                <button onClick={() => setSelectedCat('all')}><X size={11} /></button>
              </span>
            )}
            {priceRange && (
              <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full border border-primary-100">
                {PRICE_RANGES.find(r => r.value === priceRange)?.label}
                <button onClick={() => setPriceRange('')}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-8">
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24 space-y-6">
              <div>
                <h3 className="font-serif font-semibold text-dark mb-3">Categories</h3>
                <div className="space-y-1">
                  {allCats.map(cat => (
                    <button key={cat.slug} onClick={() => setSelectedCat(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${selectedCat === cat.slug
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-dark mb-3">Price Range</h3>
                <div className="space-y-1">
                  {PRICE_RANGES.map(r => (
                    <button key={r.value} onClick={() => setPriceRange(r.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${priceRange === r.value
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                {products.length === 0 ? (
                  <>
                    <h3 className="font-serif text-xl font-bold text-dark mb-2">Products Coming Soon</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">We're adding our collection. Chat with us on WhatsApp to see what's available now.</p>
                    <a href="https://wa.me/254115990547?text=Hi, I'd like to see your furniture collection" target="_blank" rel="noreferrer" className="btn-primary inline-flex">Chat on WhatsApp</a>
                  </>
                ) : selectedCat !== 'all' ? (
                  <>
                    <h3 className="font-serif text-xl font-bold text-dark mb-2">{currentCatName} is being handcrafted</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">New pieces are on the way — let us know you're interested.</p>
                    <a href={`https://wa.me/254115990547?text=${encodeURIComponent(`Hi, I'd like to know when ${currentCatName} pieces will be available`)}`} target="_blank" rel="noreferrer" className="btn-primary inline-flex">Notify Me on WhatsApp</a>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif text-xl font-bold text-dark mb-2">No products match these filters</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Try a different price range or sort option.</p>
                    <button onClick={clearAll} className="btn-outline">Clear filters</button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}