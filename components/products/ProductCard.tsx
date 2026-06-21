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

// ── Placeholder rating helpers ──────────────────────────────────────────────
// TODO: replace with real product.rating / product.review_count once the
// backend exposes these fields. Until then, each product gets a deterministic
// "fake" rating/review count seeded from its id/slug — so the same product
// always shows the same numbers, but different products show different ones.
// This is NOT real review data; swap it out as soon as the backend has it.
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // keep as 32-bit int
  }
  // normalize to [0, 1)
  return (Math.abs(hash) % 10000) / 10000;
}

function getPlaceholderRating(seed: string): number {
  const r = seededRandom(seed + '-rating');
  // spread between 3.8 and 5.0, rounded to nearest 0.1
  const rating = 3.8 + r * 1.2;
  return Math.round(rating * 10) / 10;
}

function getPlaceholderReviewCount(seed: string): number {
  const r = seededRandom(seed + '-reviews');
  // spread between 3 and 48 reviews
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
            size={12}
            className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        );
      })}
    </div>
  );
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
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;
  const uploadedDate = formatDate((product as any).created_at);

  // Placeholder until real rating/review data exists on the product object
  const ratingSeed = String((product as any).id ?? product.slug ?? product.name);
  const rating = (product as any).rating ?? getPlaceholderRating(ratingSeed);
  const reviewCount = (product as any).review_count ?? getPlaceholderReviewCount(ratingSeed);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/products/${product.slug}`} className="card block group">
        <div className="relative overflow-hidden bg-accent" style={{ aspectRatio: '4/3' }}>
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          {discount && (
            <span className="absolute top-3 left-3 bg-terracotta text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-dark text-sm font-semibold px-4 py-2 rounded-lg">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors">
              <Heart size={14} className="text-gray-600" />
            </button>
            <button
              onClick={e => { e.preventDefault(); router.push(`/products/${product.slug}`); }}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors"
            >
              <Eye size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            {product.category && (
              <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider">{product.category.name}</p>
            )}
            {uploadedDate && (
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} /> {uploadedDate}
              </p>
            )}
          </div>
          <h3 className="font-serif font-semibold text-dark text-base mb-1 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <RatingStars rating={rating} />
            <span className="text-xs text-gray-400">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-600 font-bold text-lg">KES {product.price.toLocaleString()}</p>
              {product.original_price && (
                <p className="text-gray-400 text-sm line-through">KES {product.original_price.toLocaleString()}</p>
              )}
            </div>
            {product.in_stock && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                <ShoppingCart size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}