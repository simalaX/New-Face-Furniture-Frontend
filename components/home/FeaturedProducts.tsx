'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Shows every admin-uploaded product, not just ones flagged is_featured.
    productsApi.getForHomepage(8)
      .then(data => { if (data?.length) setProducts(data); })
      .catch(() => { });
  }, []);

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">Handpicked For You</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-primary-500 font-medium hover:gap-3 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product, i) => (
            <motion.div key={product.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10 md:hidden">
          <Link href="/products" className="btn-outline">View All Products <ArrowRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}