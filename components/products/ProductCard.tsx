'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Calendar, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props { product: Product; }

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

function getPlaceholderRating(seed: string): number {
  const r = seededRandom(seed + '-rating');
  const rating = 3.8 + r * 1.2;
  return Math.round(rating * 10) / 10;
}

function getPlaceholderReviewCount(seed: string): number {
  const r = seededRandom(seed + '-reviews');
  return Math.floor(3 + r * 45);
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.round(rating);
        return (
          <Star
            key={i}
            size={11}
            className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        );
      })}
    </div>
  );
}

// ─── Real Discount Calculator ────────────────────────────────────────────────
function calculateDiscount(salePrice: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const img = product.images?.[0] || '/placeholder-furniture.jpg';
  const discount = product.original_price && product.price
    ? calculateDiscount(product.price, product.original_price)
    : null;
  const savingsAmount = product.original_price && product.price
    ? product.original_price - product.price
    : 0;
  const uploadedDate = formatDate((product as any).created_at);

  const ratingSeed = String((product as any).id ?? product.slug ?? product.name);
  const rating = (product as any).rating ?? getPlaceholderRating(ratingSeed);
  const reviewCount = (product as any).review_count ?? getPlaceholderReviewCount(ratingSeed);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/products/${product.slug}`} className="card block group overflow-hidden">

        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-accent" style={{ aspectRatio: '1/1' }}>
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Discount Badge - Luxury Red Gradient */}
          {discount && discount > 0 && (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              -{discount}%
            </span>
          )}

          {/* Hover icons: desktop only, hidden on touch/mobile */}
          <div className="hidden sm:flex absolute top-2 right-2 flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors">
              <Heart size={12} className="text-gray-600" />
            </button>
            <button
              onClick={e => { e.preventDefault(); router.push(`/products/${product.slug}`); }}
              className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors"
            >
              <Eye size={12} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-2 sm:p-4">
          <div className="hidden sm:flex items-center justify-between mb-0.5">
            {product.category && (
              <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider truncate max-w-[60%]">
                {product.category.name}
              </p>
            )}
            {uploadedDate && (
              <p className="flex items-center gap-0.5 text-xs text-gray-400">
                <Calendar size={10} /> {uploadedDate}
              </p>
            )}
          </div>

          <h3 className="font-serif font-semibold text-dark text-xs sm:text-base mb-1 line-clamp-2 sm:line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-1.5">
            <RatingStars rating={rating} />
            <span className="text-[10px] sm:text-xs text-gray-400">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>

          {/* Luxury Price Section with Gradient */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                KES {product.price.toLocaleString()}
              </p>
              {product.original_price && (
                <p className="text-gray-400 text-[10px] sm:text-xs line-through">
                  KES {product.original_price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Savings Callout */}
            {savingsAmount > 0 && (
              <p className="text-[10px] sm:text-xs text-green-600 font-semibold mt-0.5">
                💰 Save KES {savingsAmount.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl items-center justify-center transition-all shadow-md">
              <ShoppingCart size={14} />
            </motion.button>
          </div>
        </div>

      </Link>
    </motion.div>
  );
}