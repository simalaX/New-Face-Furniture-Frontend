'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props { product: Product; }

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
          {product.category && (
            <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mb-1">{product.category.name}</p>
          )}
          <h3 className="font-serif font-semibold text-dark text-base mb-2 line-clamp-2">{product.name}</h3>
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