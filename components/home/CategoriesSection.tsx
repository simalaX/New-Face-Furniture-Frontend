'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sofa, BedDouble, UtensilsCrossed, Coffee, Tv, FolderOpen, Briefcase, Ruler, Grid3X3, Mountain, Building2, Home, Package, Wine, BarChart3 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Icon map for categories
const iconMap: Record<string, React.ComponentType<any>> = {
  'sofas-seating': Sofa,
  'beds-bedroom': BedDouble,
  'dining-sets': UtensilsCrossed,
  'coffee-tables': Coffee,
  'tv-stands': Tv,
  'wardrobes': FolderOpen,
  'office-furniture': Briefcase,
  'accent-chairs': Grid3X3,
  'outdoor-furniture': Mountain,
  'storage-solutions': Package,
  'hotel-restaurant': Building2,
  'airbnb-furnishing': Home,
  'lounges': Wine,
  'bar-stools': BarChart3,
  'custom': Ruler,
};

const colorMap: Record<string, string> = {
  'sofas-seating': 'bg-orange-50 text-orange-500',
  'beds-bedroom': 'bg-blue-50 text-blue-500',
  'dining-sets': 'bg-green-50 text-green-500',
  'coffee-tables': 'bg-yellow-50 text-yellow-600',
  'tv-stands': 'bg-purple-50 text-purple-500',
  'wardrobes': 'bg-pink-50 text-pink-500',
  'office-furniture': 'bg-indigo-50 text-indigo-500',
  'accent-chairs': 'bg-red-50 text-red-500',
  'outdoor-furniture': 'bg-teal-50 text-teal-500',
  'storage-solutions': 'bg-cyan-50 text-cyan-500',
  'hotel-restaurant': 'bg-amber-50 text-amber-600',
  'airbnb-furnishing': 'bg-lime-50 text-lime-600',
  'lounges': 'bg-rose-50 text-rose-500',
  'bar-stools': 'bg-violet-50 text-violet-500',
  'custom': 'bg-primary-50 text-primary-500',
};

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoriesSection() {
  const [categories, setCat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/categories/`);
        if (res.ok) {
          const data = await res.json();
          setCat(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">What We Make</p>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">From living rooms to offices, we craft furniture for every space.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.slug] || Grid3X3;
            const color = colorMap[cat.slug] || 'bg-gray-50 text-gray-500';
            return (
              <motion.div key={cat.slug}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-accent transition-colors text-center">
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-dark">{cat.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}