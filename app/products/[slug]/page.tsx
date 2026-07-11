'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Ruler, Package, MessageCircle, Minus, Plus, Star } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';

// ── Placeholder rating helpers (mirrors components/products/ProductCard.tsx) ─
// TODO: replace with real product.rating / product.review_count once the
// backend exposes these fields. Until then, each product gets a deterministic
// "fake" rating/review count seeded from its id/slug — so the same product
// always shows the same numbers everywhere (card grid + detail page), but
// different products show different ones. This is NOT real review data.
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // keep as 32-bit int
  }
  return (Math.abs(hash) % 10000) / 10000;
}

function getPlaceholderRating(seed: string): number {
  const r = seededRandom(seed + '-rating');
  const rating = 3.8 + r * 1.2; // spread between 3.8 and 5.0
  return Math.round(rating * 10) / 10;
}

function getPlaceholderReviewCount(seed: string): number {
  const r = seededRandom(seed + '-reviews');
  return Math.floor(3 + r * 45); // spread between 3 and 48 reviews
}

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.round(rating);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        );
      })}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi.getBySlug(slug)
      .then(d => setProduct(d || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Fetch related products: same category, excluding current product ──────
  useEffect(() => {
    if (!product) return;
    setRelatedLoading(true);
    productsApi.getAll({ limit: 50 })
      .then(all => {
        if (!all?.length) { setRelatedProducts([]); return; }
        const related = all
          .filter((p: Product) => p.id !== product.id)
          .filter((p: Product) => product.category ? p.category?.slug === product.category.slug : true)
          .slice(0, 4);
        setRelatedProducts(related);
      })
      .catch(() => setRelatedProducts([]))
      .finally(() => setRelatedLoading(false));
  }, [product]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart!`);
  };

  const whatsappMsg = encodeURIComponent(`Hello New Face Furniture, I'm interested in: ${product.name} (KES ${product.price?.toLocaleString()}). Please share more details.`);
  const imgs = product.images?.length ? product.images : [];

  // Placeholder until real rating/review data exists on the product object
  const ratingSeed = String((product as any).id ?? product.slug ?? product.name);
  const rating = (product as any).rating ?? getPlaceholderRating(ratingSeed);
  const reviewCount = (product as any).review_count ?? getPlaceholderReviewCount(ratingSeed);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-500">Products</Link>
          <span>/</span>
          <span className="text-dark font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm mb-4" style={{ aspectRatio: '1' }}>
              <div className="absolute inset-0 flex items-center justify-center bg-accent">
                <div className="text-center">
                  <Package size={60} className="text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-400 text-sm font-medium">{product.name}</p>
                </div>
              </div>
              {imgs[0] !== '/placeholder-furniture.jpg' && (
                <Image src={imgs[activeImg]} alt={product.name} fill className="object-cover" />
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                  <span className="bg-white text-dark font-semibold px-6 py-3 rounded-xl">Out of Stock</span>
                </div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-3">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary-500' : 'border-transparent'}`}>
                    <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <Link href={`/products?category=${product.category.slug}`}
                className="inline-block text-xs text-secondary-600 bg-secondary-50 font-medium uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <RatingStars rating={rating} />
              <span className="text-sm text-gray-500">
                {rating.toFixed(1)} &middot; {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-primary-500">KES {product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-xl text-gray-400 line-through">KES {product.original_price.toLocaleString()}</span>
              )}
              {product.original_price && (
                <span className="bg-terracotta/10 text-terracotta text-sm font-semibold px-2 py-0.5 rounded-lg">
                  Save KES {(product.original_price - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Specs */}
            <div className="bg-white rounded-2xl p-5 mb-6 space-y-3">
              {product.dimensions && (
                <div className="flex items-start gap-3">
                  <Ruler size={16} className="text-secondary-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-xs text-gray-400 mb-0.5">Dimensions</p><p className="text-sm text-dark">{product.dimensions}</p></div>
                </div>
              )}
              {product.materials && (
                <div className="flex items-start gap-3">
                  <Package size={16} className="text-secondary-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-xs text-gray-400 mb-0.5">Materials</p><p className="text-sm text-dark">{product.materials}</p></div>
                </div>
              )}
            </div>

            {/* Quantity + Cart */}
            {product.in_stock && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                    className="btn-primary flex-1 justify-center py-4 text-base">
                    <ShoppingCart size={20} /> Add to Cart
                  </motion.button>
                  <a href={`https://wa.me/254115990547?text=${whatsappMsg}`} target="_blank" rel="noreferrer"
                    className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                    <MessageCircle size={22} />
                  </a>
                </div>
                <Link href="/checkout" className="btn-outline w-full justify-center py-4 text-base">
                  Buy Now
                </Link>
              </div>
            )}

            <div className="bg-primary-50 rounded-2xl p-4 text-sm text-primary-700">
              <p className="font-medium mb-1">🚚 Countrywide Delivery Available</p>
              <p className="text-primary-600 text-xs">Most orders completed within 5 working days. Contact us for bulk or custom specifications.</p>
            </div>
          </div>
        </div>

        {/* Rating summary stat boxes */}
        <div className="grid grid-cols-2 gap-4 max-w-md mt-12 mb-4">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="font-serif text-3xl font-bold text-dark">{rating.toFixed(1)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Rating</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="font-serif text-3xl font-bold text-dark">{reviewCount}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Review{reviewCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Related Products */}
        {!relatedLoading && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-dark mb-6">Related Products</h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}