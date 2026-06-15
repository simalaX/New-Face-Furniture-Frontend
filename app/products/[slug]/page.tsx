'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Ruler, Package, CheckCircle, MessageCircle, Minus, Plus } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi.getBySlug(slug)
      .then(d => setProduct(d || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart!`);
  };

  const whatsappMsg = encodeURIComponent(`Hello New Face Furniture, I'm interested in: ${product.name} (KES ${product.price?.toLocaleString()}). Please share more details.`);
  const imgs = product.images?.length ? product.images : [];

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
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark mb-4">{product.name}</h1>

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

            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <><CheckCircle size={18} className="text-green-500" /><span className="text-green-600 text-sm font-medium">In Stock — Ready to Order</span></>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
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
      </div>
    </div>
  );
}
