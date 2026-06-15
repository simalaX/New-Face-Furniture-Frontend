'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How long does furniture production take?',
    a: `Most custom furniture orders are completed within 5 working days. This includes production, quality checking, and preparation for delivery. Complex orders involving multiple pieces or intricate designs may take 7–10 working days. We'll always give you an accurate timeline when you place your order, and we keep you updated throughout the process.`,
  },
  {
    q: 'Do you offer countrywide delivery?',
    a: 'Yes! We deliver to all 47 counties across Kenya. Our delivery team handles transport safely and professionally. Delivery fees depend on your location and the size of your order. Nairobi and surrounding areas typically have lower delivery costs, while upcountry deliveries are calculated based on distance and freight costs.',
  },
  {
    q: 'Can I order custom furniture?',
    a: 'Absolutely — custom orders are our speciality! You can specify exact dimensions, preferred materials, fabric or finish colors, and any design features you need. Simply fill in our custom order form, attach reference images if you have them, and our team will get back to you with a quote within 24 hours. You can also reach us directly on WhatsApp for a faster response.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept M-Pesa (our most popular option), bank transfer, and cash on delivery for local Nairobi orders. For large or custom orders, we typically require a 50% deposit before production begins, with the balance paid upon delivery. All payment details are confirmed when you place your order.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-3">Help Centre</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400">Everything you need to know about ordering from New Face Furniture.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-accent transition-colors">
                <span className="font-serif font-semibold text-dark text-lg pr-6">{faq.q}</span>
                <ChevronDown size={20} className={`text-primary-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-6 pb-6 text-gray-500 leading-relaxed border-t border-gray-50 pt-4">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-center bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-dark mb-3">Still have questions?</h3>
          <p className="text-gray-500 mb-6">Our team is happy to help. Reach out on WhatsApp or give us a call.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://wa.me/254115990547" target="_blank" rel="noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
              WhatsApp Us
            </a>
            <a href="tel:+254115990547" className="btn-outline">Call +254 115 990 547</a>
          </div>
        </div>
      </div>
    </div>
  );
}
