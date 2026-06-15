'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sofa, BedDouble, UtensilsCrossed, Coffee, Tv, FolderOpen, Briefcase, Ruler } from 'lucide-react';

const categories = [
  { name: 'Sofas', icon: Sofa, slug: 'sofas', color: 'bg-orange-50 text-orange-500' },
  { name: 'Beds', icon: BedDouble, slug: 'beds', color: 'bg-blue-50 text-blue-500' },
  { name: 'Dining Sets', icon: UtensilsCrossed, slug: 'dining-sets', color: 'bg-green-50 text-green-500' },
  { name: 'Coffee Tables', icon: Coffee, slug: 'coffee-tables', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'TV Stands', icon: Tv, slug: 'tv-stands', color: 'bg-purple-50 text-purple-500' },
  { name: 'Wardrobes', icon: FolderOpen, slug: 'wardrobes', color: 'bg-pink-50 text-pink-500' },
  { name: 'Office', icon: Briefcase, slug: 'office-furniture', color: 'bg-indigo-50 text-indigo-500' },
  { name: 'Custom', icon: Ruler, slug: 'custom', color: 'bg-primary-50 text-primary-500' },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">What We Make</p>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">From living rooms to offices, we craft furniture for every space.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.slug}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-accent transition-colors text-center">
                  <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
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
