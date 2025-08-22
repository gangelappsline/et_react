
import Header from './Header';
import HeroSection from './HeroSection';
import ContactForm from './ContactForm';
import Footer from './Footer';

import ServicesSection from './ServicesSection';
import AboutSection from './AboutSection';
import SchedulingSection from './SchedulingSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6fbfd] text-black">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
  <SchedulingSection />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
