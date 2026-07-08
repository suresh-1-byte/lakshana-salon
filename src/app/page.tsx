import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { Experts } from '@/components/Experts';
import { SpecialOffers } from '@/components/SpecialOffers';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Gallery } from '@/components/Gallery';
import { Testimonials } from '@/components/Testimonials';
import { BookingSection } from '@/components/BookingSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <main className="relative bg-luxury-onyx text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <Hero />
      <About />
      <Services />
      <Experts />
      <SpecialOffers />
      <WhyChooseUs />
      
      <Gallery />
      <Testimonials />
      <BookingSection />
      <ContactSection />
      
      {/* Footer */}
      <Footer />

      {/* WhatsApp Float Button */}
      <WhatsAppFloat />
    </main>
  );
}
