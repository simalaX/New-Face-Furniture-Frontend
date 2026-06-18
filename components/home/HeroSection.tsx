'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SLIDE_INTERVAL = 4000;

const FALLBACK = (
  <div className="absolute inset-0 bg-gradient-to-br from-[#3D2B1F] via-[#5C3D2E] to-[#8B5E3C]" />
);

const CATEGORIES = [
  { label: 'All', slug: 'all' },
  { label: 'Sofas & Seating', slug: 'sofas-seating' },
  { label: 'Beds & Bedroom', slug: 'beds-bedroom' },
  { label: 'Dining Sets', slug: 'dining-sets' },
  { label: 'Coffee Tables', slug: 'coffee-tables' },
  { label: 'TV Stands', slug: 'tv-stands' },
  { label: 'Wardrobes', slug: 'wardrobes' },
  { label: 'Office Furniture', slug: 'office-furniture' },
  { label: 'Accent Chairs', slug: 'accent-chairs' },
  { label: 'Outdoor Furniture', slug: 'outdoor-furniture' },
  { label: 'Storage Solutions', slug: 'storage-solutions' },
  { label: 'Hotel & Restaurant', slug: 'hotel-restaurant' },
  { label: 'Airbnb Furnishing', slug: 'airbnb-furnishing' },
  { label: 'Lounges', slug: 'lounges' },
  { label: 'Bar Stools', slug: 'bar-stools' },
  { label: 'Custom', slug: 'custom' },
];

const PRICE_RANGES = [
  { label: 'Any Price', value: '' },
  { label: 'Under KES 20K', value: '0-20000' },
  { label: 'KES 20K – 50K', value: '20000-50000' },
  { label: 'KES 50K – 100K', value: '50000-100000' },
  { label: 'KES 100K – 200K', value: '100000-200000' },
  { label: 'Above KES 200K', value: '200000-999999999' },
];

export default function HeroSection() {
  const router = useRouter();

  // slideshow
  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('default');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Fetch product images ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/products/?limit=100`);
        if (!res.ok) return;
        const data: any[] = await res.json();
        const urls: string[] = [];
        for (const p of data) {
          if (!Array.isArray(p.images)) continue;
          for (const img of p.images) {
            const url = typeof img === 'string' ? img : img?.secure_url;
            if (url && !urls.includes(url)) urls.push(url);
          }
        }
        if (urls.length > 0) setImages(urls);
      } catch { }
      finally { setLoaded(true); }
    }
    load();
  }, []);

  // ── Auto-advance ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % images.length), SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images]);

  function go(dir: 1 | -1) {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(c => (c + dir + images.length) % images.length);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % images.length), SLIDE_INTERVAL);
  }

  // ── Search handler ──────────────────────────────────────────────────────────
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'all') params.set('category', category);
    if (priceRange) params.set('price', priceRange);
    if (sort && sort !== 'default') params.set('sort', sort);
    router.push(`/products?${params.toString()}`);
  }

  function clearSearch() {
    setSearch('');
    setCategory('all');
    setPriceRange('');
    setSort('default');
    setShowAdvanced(false);
  }

  const hasFilters = search || category !== 'all' || priceRange || sort !== 'default';
  const hasImages = images.length > 0;

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">

      {/* ── Background slideshow ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {!loaded && FALLBACK}
        {hasImages && (
          <AnimatePresence mode="sync">
            <motion.img
              key={images[current]}
              src={images[current]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </AnimatePresence>
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Star size={14} fill="currentColor" className="text-[#F5C842]" />
              Trusted Furniture Makers in Kenya
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
              Furniture That
              <span className="block text-[#F5C842]">Tells Your Story</span>
            </h1>

            {/* Subheading */}
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Custom-made furniture for homes, offices, restaurants and hotels. Expert
              craftsmanship, quality materials, and timeless designs — delivered across Kenya.
            </p>

            {/* ── Search bar ───────────────────────────────────────────────── */}
            <form onSubmit={handleSearch} className="mb-8">
              {/* Main search row */}
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search sofas, beds, dining sets..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/95 backdrop-blur-sm text-dark placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] shadow-lg"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <button type="submit"
                  className="px-5 py-3.5 bg-[#8B5E3C] hover:bg-[#734E31] text-white font-semibold text-sm rounded-xl transition-colors shadow-lg whitespace-nowrap flex items-center gap-2">
                  Search <ArrowRight size={16} />
                </button>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${category === c.slug
                      ? 'bg-[#8B5E3C] border-[#8B5E3C] text-white'
                      : 'bg-white/15 border-white/25 text-white hover:bg-white/25'
                      }`}
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 ${showAdvanced
                    ? 'bg-white/25 border-white/40 text-white'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}
                >
                  <SlidersHorizontal size={12} /> Advanced
                </button>
                {hasFilters && (
                  <button type="button" onClick={clearSearch}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1">
                    <X size={11} /> Clear
                  </button>
                )}
              </div>

              {/* Advanced filters panel */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 pt-2 pb-1">
                      {/* Price range */}
                      <div className="flex flex-col gap-1">
                        <label className="text-white/60 text-xs uppercase tracking-wide">Price Range</label>
                        <select
                          value={priceRange}
                          onChange={e => setPriceRange(e.target.value)}
                          className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] min-w-[180px]"
                        >
                          {PRICE_RANGES.map(r => (
                            <option key={r.value} value={r.value} className="text-dark bg-white">
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Sort */}
                      <div className="flex flex-col gap-1">
                        <label className="text-white/60 text-xs uppercase tracking-wide">Sort By</label>
                        <select
                          value={sort}
                          onChange={e => setSort(e.target.value)}
                          className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] min-w-[180px]"
                        >
                          <option value="default" className="text-dark bg-white">Default</option>
                          <option value="price-asc" className="text-dark bg-white">Price: Low to High</option>
                          <option value="price-desc" className="text-dark bg-white">Price: High to Low</option>
                          <option value="name-asc" className="text-dark bg-white">Name A–Z</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/products"
                className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#734E31] text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-colors shadow-lg">
                Browse Collection <ArrowRight size={18} />
              </Link>
              <Link href="/custom-order"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-colors">
                Custom Order
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Truck, text: 'Countrywide Delivery' },
                { icon: Shield, text: '5-Day Lead Time' },
                { icon: Star, text: 'Quality Guaranteed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#F5C842]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      {/* ── Slideshow controls ────────────────────────────────────────────── */}
      {images.length > 1 && (
        <>
          <button onClick={() => go(-1)}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Previous image">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => go(1)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Next image">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
            {images.slice(0, 10).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current % 10 ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="absolute top-5 right-5 z-20 text-xs text-white/60 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full select-none">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </section>
  );
}