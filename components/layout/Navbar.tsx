'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Home, Info, Package, Grid, Ruler, Star, HelpCircle, Phone, ChevronRight, Tag, Coffee, Bed, Box, Leaf, Monitor } from 'lucide-react';
import { useCartStore } from '@/lib/store';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/custom-order', label: 'Custom Orders', icon: Ruler },
  { href: '/testimonials', label: 'Reviews', icon: Star },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/contact', label: 'Contact', icon: Phone },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore(s => s.itemCount());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="New Face Furniture" onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
              <div className="hidden sm:block">
                <p className="font-serif font-bold text-dark text-lg leading-none">New Face</p>
                <p className="text-xs text-secondary-500 font-medium tracking-wide">FURNITURE</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === l.href ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link href="/cart" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
                <ShoppingCart size={22} className="text-dark" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/checkout" className="hidden md:flex btn-primary text-sm py-2 px-4">
                Order Now
              </Link>
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors">
                <Menu size={22} className="text-dark" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="New Face Furniture" onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                  <div>
                    <p className="font-serif font-bold text-dark text-lg">New Face Furniture</p>
                    <p className="text-xs text-secondary-500">Nairobi, Kenya</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-accent rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-5">
                {/* Navigation section */}
                <div className="mb-4">
                  <h4 className="text-xs text-secondary-400 uppercase tracking-wider mb-2">Navigation</h4>
                  <div className="space-y-1">
                    <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Home size={16} className="text-gray-400" /> <span>Home</span>
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Info size={16} className="text-gray-400" /> <span>About Us</span>
                    </Link>
                    <Link href="/custom-order" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Ruler size={16} className="text-gray-400" /> <span>Custom Orders</span>
                    </Link>
                    <Link href="/testimonials" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Star size={16} className="text-gray-400" /> <span>Reviews</span>
                    </Link>
                    <Link href="/faq" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <HelpCircle size={16} className="text-gray-400" /> <span>FAQ</span>
                    </Link>
                    <Link href="/contact" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Phone size={16} className="text-gray-400" /> <span>Contact</span>
                    </Link>
                  </div>
                </div>

                {/* Categories section */}
                <div className="mb-4">
                  <h4 className="text-xs text-secondary-400 uppercase tracking-wider mb-2">Categories</h4>
                  <div className="space-y-1">
                    {[
                      { name: 'All Products', slug: 'all', Icon: Tag },
                      { name: 'Accent Chairs', slug: 'accent-chairs', Icon: Tag },
                      { name: 'Dining Sets', slug: 'dining-sets', Icon: Package },
                      { name: 'Beds & Bedroom', slug: 'beds', Icon: Bed },
                      { name: 'Office Furniture', slug: 'office-furniture', Icon: Monitor },
                      { name: 'Outdoor Furniture', slug: 'outdoor-furniture', Icon: Leaf },
                      { name: 'Storage Solutions', slug: 'storage', Icon: Package },
                      { name: 'Hotel & Restaurant', slug: 'hotel-restaurant', Icon: Box },
                      { name: 'Airbnb Furnishing', slug: 'airbnb', Icon: Home },
                      { name: 'Coffee Tables', slug: 'coffee-tables', Icon: Coffee },
                      { name: 'Sofas & Seating', slug: 'sofas', Icon: Package },
                      { name: 'TV Stands', slug: 'tv-stands', Icon: Monitor },
                      { name: 'Lounges', slug: 'lounges', Icon: Grid },
                      { name: 'Bar Stools', slug: 'bar-stools', Icon: Package },
                    ].map(cat => (
                      <Link key={cat.slug} href={`/products?category=${encodeURIComponent(cat.slug)}`}
                        className="flex items-center justify-between p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <cat.Icon size={16} className="text-gray-400" />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account section */}
                <div className="mt-2 border-t pt-4">
                  <h4 className="text-xs text-secondary-400 uppercase tracking-wider mb-2">Account</h4>
                  <div className="space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <Grid size={16} className="text-gray-400" /> <span>Login</span>
                    </Link>
                    <Link href="/cart" className="flex items-center justify-between p-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={16} className="text-gray-400" /> <span>Cart</span>
                      </div>
                      {itemCount > 0 && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">{itemCount}</span>
                      )}
                    </Link>
                  </div>
                </div>
              </nav>
              <div className="p-5 border-t border-gray-100">
                <Link href="/custom-order" className="btn-primary w-full justify-center">
                  Get Custom Quote
                </Link>
                <p className="text-center text-xs text-gray-400 mt-3">+254 115 990 547</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="h-16 md:h-20" />
    </>
  );
}