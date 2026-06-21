import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'New Face Furniture Kenya | #1 Custom Furniture Makers in Nairobi',
    template: '%s | New Face Furniture Kenya',
  },
  description: "Bespoke furniture, handcrafted in Nairobi. New Face Furniture creates custom sofas, beds, dining sets & more — quality craftsmanship, countrywide delivery.",
  keywords: [
    'New Face Furniture',
    'New Face Furniture Kenya',
    'furniture kenya',
    'furniture nairobi',
    'custom furniture kenya',
    'custom furniture nairobi',
    'sofas kenya',
    'sofa set nairobi',
    'L shape sofa kenya',
    'beds nairobi',
    'king size bed kenya',
    'beds with storage kenya',
    'dining sets kenya',
    'dining table nairobi',
    '6 seater dining set kenya',
    'coffee tables kenya',
    'coffee tables nairobi',
    'office furniture kenya',
    'office desk nairobi',
    'wardrobes kenya',
    'wardrobes nairobi',
    'TV stands kenya',
    'TV stands nairobi',
    'furniture shop nairobi',
    'furniture shop ngara',
    'furniture makers nairobi',
    'furniture manufacturer kenya',
    'custom made furniture kenya',
    'affordable furniture kenya',
    'best furniture kenya',
    'furniture delivery kenya',
    'furniture countrywide delivery kenya',
    'hotel furniture kenya',
    'restaurant furniture kenya',
    'school furniture kenya',
    'apartment furniture kenya',
  ],
  authors: [{ name: 'New Face Furniture Kenya' }],
  creator: 'New Face Furniture Kenya',
  publisher: 'New Face Furniture Kenya',
  metadataBase: new URL('https://newfacefurniture.co.ke'),
  alternates: { canonical: '/' },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'New Face Furniture Kenya | Bespoke Furniture, Handcrafted in Nairobi',
    description: "Elevated, made-to-order furniture for discerning homes. Custom sofas, beds, dining sets, coffee tables & more — crafted with quality materials and delivered countrywide. Request your bespoke quote today.",
    url: 'https://newfacefurniture.co.ke',
    siteName: 'New Face Furniture Kenya',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'New Face Furniture Kenya - Custom Furniture Makers in Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Face Furniture Kenya | Bespoke Furniture, Handcrafted in Nairobi',
    description: 'Custom sofas, beds, dining sets & more — handcrafted in Nairobi with quality materials, delivered countrywide.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FurnitureStore',
              name: 'New Face Furniture Kenya',
              alternateName: 'New Face Furniture',
              description: "Bespoke furniture, handcrafted in Nairobi. New Face Furniture creates custom sofas, beds, dining sets, coffee tables, wardrobes and office furniture with quality materials, delivered countrywide.",
              url: 'https://newfacefurniture.co.ke',
              logo: 'https://newfacefurniture.co.ke/logo.png',
              image: 'https://newfacefurniture.co.ke/og-image.jpg',
              telephone: '+254115990547',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Desai Road, Ngara',
                addressLocality: 'Nairobi',
                addressRegion: 'Nairobi County',
                addressCountry: 'KE',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -1.279,
                longitude: 36.826,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                  opens: '08:00',
                  closes: '19:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Sunday',
                  opens: '10:00',
                  closes: '16:00',
                },
              ],
              sameAs: ['https://www.instagram.com/new_face_furniture/'],
              priceRange: 'KES 5,000 - KES 500,000',
              currenciesAccepted: 'KES',
              paymentAccepted: 'M-Pesa, Cash, Bank Transfer',
              areaServed: { '@type': 'Country', name: 'Kenya' },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Furniture Collection',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Custom Sofas & Couches' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Beds & Headboards' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Dining Sets & Tables' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Coffee Tables' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Wardrobes' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'TV Stands' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Office Furniture' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Custom Furniture' } },
                ],
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '500',
                bestRating: '5',
              },
            }),
          }}
        />

        {/* FAQ Structured Data — expands directly in Google results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How long does furniture production take in Kenya?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'At New Face Furniture, most custom orders are completed within 5 working days. We serve all 47 counties in Kenya.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do you deliver furniture countrywide in Kenya?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! New Face Furniture delivers to all 47 counties across Kenya — Nairobi, Mombasa, Kisumu, Nakuru, Eldoret and beyond.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I order custom furniture in Nairobi?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely! Custom furniture is our specialty. Specify dimensions, materials and design. Contact us on WhatsApp +254115990547.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What payment methods do you accept?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We accept M-Pesa, bank transfer and cash on delivery.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Where is New Face Furniture located?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We are located along Desai Road, Ngara, Nairobi, Kenya. Open Monday to Saturday 8AM-7PM and Sunday 10AM-4PM.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', background: '#1E1E1E', color: '#fff' },
          }}
        />
        {/* Ctrl + Shift + A → /admin (hidden shortcut) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                  e.preventDefault();
                  window.location.href = '/admin';
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}