import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'New Face Furniture', template: '%s | New Face Furniture' },
  description: 'Premium custom-made furniture for homes, offices, restaurants, hotels and commercial spaces. Located in Nairobi, delivering countrywide.',
  keywords: ['furniture kenya', 'custom furniture nairobi', 'sofas kenya', 'beds nairobi', 'office furniture kenya'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'New Face Furniture',
    description: 'Premium custom-made furniture. Expert craftsmanship, quality materials, timeless designs.',
    url: 'https://newfacefurniture.co.ke',
    siteName: 'New Face Furniture',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

// Inline client component for the keyboard shortcut only
function AdminShortcut() {
  'use client';
  // Ctrl + Shift + A → /admin
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.href = '/admin';
      }
    }, { once: false });
  }
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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