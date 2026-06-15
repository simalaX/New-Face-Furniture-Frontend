'use client';
import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Award, Hammer, Leaf, Star, ChevronDown, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// WHY CHOOSE US
export function WhyChooseUs() {
  const reasons = [
    { icon: Award, title: 'Expert Craftsmanship', desc: 'Our skilled artisans have over 10 years of experience creating premium furniture.', color: 'text-primary-500 bg-primary-50' },
    { icon: Leaf, title: 'Quality Materials', desc: 'We source only the finest wood, fabric, and metal for long-lasting furniture.', color: 'text-green-500 bg-green-50' },
    { icon: Hammer, title: 'Custom Made', desc: 'Every piece is crafted to your exact specifications and preferences.', color: 'text-secondary-600 bg-secondary-50' },
    { icon: Clock, title: '5-Day Lead Time', desc: 'Most custom orders completed and ready for delivery within 5 days.', color: 'text-blue-500 bg-blue-50' },
    { icon: Truck, title: 'Countrywide Delivery', desc: 'We deliver to all 47 counties across Kenya safely and efficiently.', color: 'text-purple-500 bg-purple-50' },
    { icon: Shield, title: 'Quality Guarantee', desc: 'Every piece comes with our quality guarantee for your peace of mind.', color: 'text-red-500 bg-red-50' },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">Why Us</p>
          <h2 className="section-title">Why Choose New Face?</h2>
          <p className="section-subtitle">We combine craftsmanship, quality, and customer care to deliver furniture you'll love for years.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex gap-5">
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${r.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-dark text-lg mb-2">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// CUSTOM PROCESS
export function CustomProcess() {
  const steps = [
    { n: '01', title: 'Contact Us', desc: 'Reach out via WhatsApp, call, or our custom order form with your requirements.' },
    { n: '02', title: 'Design & Quote', desc: 'We discuss your needs, share design ideas, and provide a detailed quote.' },
    { n: '03', title: 'Production', desc: 'Our craftsmen build your furniture using quality materials within 5 days.' },
    { n: '04', title: 'Delivery', desc: 'We deliver and install your furniture safely anywhere in Kenya.' },
  ];
  return (
    <section className="py-20 bg-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400 rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-400 font-medium text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Our Custom Order Process</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Getting your dream furniture is simple with our streamlined process.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}
              className="relative">
              <div className="text-6xl font-serif font-bold text-secondary-400/20 mb-4">{s.n}</div>
              <h3 className="font-serif font-semibold text-xl text-white mb-3">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 text-secondary-400/30 text-2xl">→</div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/custom-order" className="btn-secondary text-base px-8 py-4">
            Start Custom Order <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// TESTIMONIALS HOME
export function TestimonialsSection() {
  const reviews = [
    { name: 'Mary Wanjiku', location: 'Westlands, Nairobi', rating: 5, text: 'Absolutely stunning sofa set! The quality exceeded my expectations. Delivery was on time and the installation team was professional.' },
    { name: 'James Mwangi', location: 'Kisumu', rating: 5, text: 'Ordered a custom dining set for my restaurant. The craftsmanship is exceptional and my customers always compliment the furniture.' },
    { name: 'Aisha Hassan', location: 'Mombasa', rating: 5, text: 'Fast delivery to Mombasa! The bedroom set looks amazing and fits perfectly in my room. Will definitely order again.' },
  ];
  return (
    <section className="py-20 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">Customer Love</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex mb-4">
                {[...Array(r.rating)].map((_, j) => <Star key={j} size={16} fill="#D9B382" className="text-secondary-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="font-serif font-bold text-primary-600">{r.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs">{r.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/testimonials" className="btn-outline">Read All Reviews <ArrowRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}

// FAQ PREVIEW
export function FAQPreview() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'How long does furniture production take?', a: 'Most custom furniture orders are completed within 5 working days. Complex or bulk orders may take 7–10 days. We keep you updated throughout the process.' },
    { q: 'Do you offer countrywide delivery?', a: 'Yes! We deliver to all 47 counties across Kenya. Delivery fees vary by location and are calculated at checkout.' },
    { q: 'Can I order custom furniture?', a: 'Absolutely! Custom orders are our specialty. You can specify dimensions, materials, colors, and design. Use our custom order form or contact us on WhatsApp.' },
    { q: 'What payment methods do you accept?', a: 'We accept M-Pesa, bank transfer, and cash on delivery. For large orders, a 50% deposit is required before production begins.' },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">Questions</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-accent transition-colors">
                <span className="font-medium text-dark pr-4">{faq.q}</span>
                <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/faq" className="btn-outline">View All FAQs <ArrowRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}

// MAP
export function MapSection() {
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="section-title">Find Us in Nairobi</h2>
          <p className="section-subtitle">Visit our showroom along Desai Road, Ngara, Nairobi.</p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.818!2d36.826!3d-1.279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d0ee1b6b0b%3A0x0!2sDesai%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
            width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" title="New Face Furniture Location"
          />
        </div>
      </div>
    </section>
  );
}

// CONTACT CTA
export function ContactCTA() {
  return (
    <section className="py-20 bg-primary-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to Furnish Your Space?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Contact us today for a free consultation and quote. We'll help you create the perfect furniture for your home or business.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/custom-order" className="bg-white text-primary-600 hover:bg-accent px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
              Get Custom Quote <ArrowRight size={18} />
            </Link>
            <a href="tel:+254115990547" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
              <Phone size={18} /> Call Us Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
