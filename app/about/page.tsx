import type { Metadata } from 'next';
import { Award, Hammer, Leaf, Truck, Users, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'About Us' };

export default function AboutPage() {
  const values = [
    { icon: Award, title: 'Excellence', desc: 'We pursue the highest standards in every piece we create.' },
    { icon: Hammer, title: 'Craftsmanship', desc: 'Skilled artisans with decades of furniture-making experience.' },
    { icon: Leaf, title: 'Quality', desc: 'Only the finest materials make it into our workshop.' },
    { icon: Users, title: 'Customer Focus', desc: 'Your satisfaction and vision guide everything we do.' },
    { icon: Truck, title: 'Reliability', desc: 'On-time delivery and honest communication, always.' },
    { icon: Clock, title: 'Efficiency', desc: 'Most custom orders completed and delivered within 5 days.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-dark text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Crafting Furniture with Purpose</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Located along Desai Road, Ngara in the heart of Nairobi, New Face Furniture has been a trusted name in Kenyan furniture manufacturing for over a decade.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-secondary-500 font-medium text-sm uppercase tracking-widest mb-3">Who We Are</p>
              <h2 className="font-serif text-3xl font-bold text-dark mb-6">Built on Trust, Driven by Craft</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>New Face Furniture is a trusted Kenyan furniture manufacturer specializing in custom-made furniture for homes, offices, restaurants, schools, apartments, hotels, and commercial spaces across Kenya.</p>
                <p>We combine expert craftsmanship, quality materials, and timeless designs to create furniture that not only looks beautiful but lasts for decades. Every piece that leaves our workshop is a reflection of our commitment to quality and customer satisfaction.</p>
                <p>Whether you need a single sofa for your living room or a complete office fitout, we treat every order with the same dedication and attention to detail.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '500+', l: 'Happy Customers' }, { n: '10+', l: 'Years Experience' },
                { n: '47', l: 'Counties Served' }, { n: '5', l: 'Days Lead Time' },
              ].map(s => (
                <div key={s.l} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <p className="font-serif text-3xl font-bold text-primary-500 mb-2">{s.n}</p>
                  <p className="text-gray-500 text-sm">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-primary-500 text-white rounded-3xl p-8">
              <h3 className="font-serif text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed">To craft exceptional, custom-made furniture that transforms living and working spaces across Kenya — combining quality craftsmanship, durable materials, and personalised service at fair prices.</p>
            </div>
            <div className="bg-secondary-400 text-dark rounded-3xl p-8">
              <h3 className="font-serif text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-dark/80 leading-relaxed">To be Kenya's most trusted furniture brand, known for unmatched quality, innovative design, and a customer-first approach that sets the standard for the industry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-bold text-dark">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-dark text-lg mb-1">{v.title}</h4>
                    <p className="text-gray-500 text-sm">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-dark mb-4">Visit Our Showroom</h2>
          <p className="text-gray-500 mb-2">Desai Road, Ngara, Nairobi, Kenya</p>
          <p className="text-gray-500 mb-2">Mon–Sat: 8AM – 7PM | Sunday: 10AM – 4PM</p>
          <p className="text-gray-500">Call us: <a href="tel:+254115990547" className="text-primary-500 font-medium">+254 115 990 547</a></p>
        </div>
      </section>
    </div>
  );
}
