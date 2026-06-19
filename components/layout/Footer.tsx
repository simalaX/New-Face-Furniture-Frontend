"use client";
import Link from 'next/link';
import { MapPin, Phone, Instagram, Clock, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="New Face Furniture" onError={(e:any) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} className="w-12 h-12 rounded-full object-cover border border-white/20" />
              <div>
                <p className="font-serif font-bold text-white text-lg leading-none">New Face</p>
                <p className="text-xs text-secondary-400 font-medium tracking-wide">FURNITURE</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Trusted furniture makers in Kenya. Expert craftsmanship, quality materials, timeless designs for homes, offices, and commercial spaces.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/new_face_furniture/" target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Collection */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Collection</h4>
            <ul className="space-y-3">
              {['Sofas & Couches', 'Beds & Headboards', 'Dining Sets', 'Coffee Tables', 'Office Furniture', 'TV Stands', 'Wardrobes', 'Custom Furniture'].map(item => (
                <li key={item}>
                  <Link href="/products" className="text-gray-400 hover:text-secondary-400 text-sm transition-colors flex items-center gap-2">
                    <ArrowRight size={12} /> {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Products', href: '/products' },
                { label: 'Custom Orders', href: '/custom-order' },
                { label: 'Testimonials', href: '/testimonials' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact', href: '/contact' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-secondary-400 text-sm transition-colors flex items-center gap-2">
                    <ArrowRight size={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-5">Contact</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin size={18} className="text-secondary-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">Desai Road, Ngara, Nairobi, Kenya</p>
              </div>
              <div className="flex gap-3">
                <Phone size={18} className="text-secondary-400 flex-shrink-0" />
                <a href="tel:+254115990547" className="text-gray-400 hover:text-white text-sm transition-colors">+254 115 990 547</a>
              </div>
              <div className="flex gap-3">
                <Instagram size={18} className="text-secondary-400 flex-shrink-0" />
                <a href="https://instagram.com/new_face_furniture" target="_blank" rel="noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors">@new_face_furniture</a>
              </div>
              <div className="flex gap-3">
                <Clock size={18} className="text-secondary-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-400 text-sm">
                  <p>Mon–Sat: 8AM – 7PM</p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 New Face Furniture Kenya. All Rights Reserved.</p>
          <p className="text-gray-600 text-xs">Desai Road, Ngara, Nairobi</p>
        </div>
      </div>
    </footer>
  );
}
