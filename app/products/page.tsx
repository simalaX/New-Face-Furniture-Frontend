'use client';
import { useState, useEffect } from 'react';
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
  { value: 'name-asc', label: 'Name A–Z' },
];

const PRICE_RANGES = [
  { label: 'Any Price', value: '' },
  { label: 'Under KES 20K', value: '0-20000' },
  { label: 'KES 20K – 50K', value: '20000-50000' },
  { label: 'KES 50K – 100K', value: '50000-100000' },
  { label: 'KES 100K – 200K', value: '100000-200000' },
  { label: 'Above KES 200K', value: '200000-999999999' },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Sofas', slug: 'sofas' },
  { id: 2, name: 'Beds', slug: 'beds' },
  { id: 3, name: 'Dining Sets', slug: 'dining-sets' },
  { id: 4, name: 'Coffee Tables', slug: 'coffee-tables' },
  { id: 5, name: 'TV Stands', slug: 'tv-stands' },
  { id: 6, name: 'Wardrobes', slug: 'wardrobes' },
  { id: 7, name: 'Office', slug: 'office' },
  { id: 8, name: 'Custom', slug: 'custom' },
];

export default function ProductsPage() {
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
      {/* Page Header */}
      <div className="bg-dark text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-2">Our Collection</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">{currentCatName}</h1>
          <p className="text-gray-400 mt-3">Premium furniture crafted for every space in Kenya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Sort + mobile filter toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {hasActiveFilters && (
              <button onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
                Clear filters
              </button>
            )}
            <select value={sort} onChange={e => setSort(e.target.value)} className="input bg-white w-52">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
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
          {/* Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24 space-y-6">

              {/* Categories */}
              <div>
                <h3 className="font-serif font-semibold text-dark mb-3">Categories</h3>
                <div className="space-y-1">
                  {allCats.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCat(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${selectedCat === cat.slug
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-serif font-semibold text-dark mb-3">Price Range</h3>
                <div className="space-y-1">
                  {PRICE_RANGES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setPriceRange(r.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${priceRange === r.value
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-5xl mb-4">🛋️</div>
                <h3 className="font-serif text-xl font-bold text-dark mb-2">
                  {products.length === 0 ? 'Products Coming Soon' : 'No products found'}
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  {products.length === 0
                    ? "We're adding our collection. Contact us on WhatsApp to see what's available now."
                    : 'Try a different category or price range.'}
                </p>
                {products.length === 0 ? (
                  <a
                    href="https://wa.me/254115990547?text=Hi, I'd like to see your furniture collection"
                    target="_blank" rel="noreferrer"
                    className="btn-primary inline-flex"
                  >
                    Chat on WhatsApp
                  </a>
                ) : (
                  <button onClick={clearAll} className="btn-outline">Clear filters</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
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