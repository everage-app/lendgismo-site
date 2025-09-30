import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" fillOpacity="0.9"/>
                    <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" fill="#0f1c4a"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">Lendgismo</div>
                  <div className="text-brand-400 text-xs font-semibold">Vixo V3</div>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, '#features')}
              className="text-sm text-zinc-300 hover:text-white transition-colors"
              data-testid="link-features"
            >
              Features
            </a>
            <a 
              href="#roi" 
              onClick={(e) => scrollToSection(e, '#roi')}
              className="text-sm text-zinc-300 hover:text-white transition-colors"
              data-testid="link-roi"
            >
              ROI
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, '#pricing')}
              className="text-sm text-zinc-300 hover:text-white transition-colors"
              data-testid="link-pricing"
            >
              Pricing
            </a>
            <Link href="/overview" className="text-sm text-zinc-300 hover:text-white transition-colors" data-testid="link-overview">
              Overview
            </Link>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')}
              className="btn-primary"
              data-testid="button-request-handoff"
            >
              Request Handoff
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, '#features')}
              className="block text-sm text-zinc-300 hover:text-white transition-colors py-2"
              data-testid="link-mobile-features"
            >
              Features
            </a>
            <a 
              href="#roi" 
              onClick={(e) => scrollToSection(e, '#roi')}
              className="block text-sm text-zinc-300 hover:text-white transition-colors py-2"
              data-testid="link-mobile-roi"
            >
              ROI
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, '#pricing')}
              className="block text-sm text-zinc-300 hover:text-white transition-colors py-2"
              data-testid="link-mobile-pricing"
            >
              Pricing
            </a>
            <Link href="/overview" className="block text-sm text-zinc-300 hover:text-white transition-colors py-2" data-testid="link-mobile-overview">
              Overview
            </Link>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')}
              className="block w-full text-center rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
              data-testid="button-mobile-request-handoff"
            >
              Request Handoff
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
