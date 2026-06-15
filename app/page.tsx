import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CustomProcess from '@/components/home/CustomProcess';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQPreview from '@/components/home/FAQPreview';
import ContactCTA from '@/components/home/ContactCTA';
import MapSection from '@/components/home/MapSection';

export const metadata: Metadata = {
  title: 'New Face Furniture',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <CustomProcess />
      <TestimonialsSection />
      <FAQPreview />
      <MapSection />
      <ContactCTA />
    </>
  );
}
