import { Link } from "wouter";
import SiteLogo from "./SiteLogo";

export default function Footer() {
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
    }
  };

  return (
    <footer className="border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <SiteLogo 
                size={40} 
                glow 
                className="logo"
                linkTestId="link-footer-logo"
                imgTestId="img-footer-logo"
              />
            </div>
            <p className="text-sm text-zinc-400 max-w-sm">
              Production-ready lender platform foundation. Own the code, ship faster.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="hover:text-white transition" data-testid="link-footer-features">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => scrollToSection(e, '#pricing')} className="hover:text-white transition" data-testid="link-footer-pricing">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/overview" className="hover:text-white transition" data-testid="link-footer-overview">
                  Overview
                </Link>
              </li>
              <li>
                <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="hover:text-white transition" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition" data-testid="link-footer-about">About</a></li>
              <li><a href="#" className="hover:text-white transition" data-testid="link-footer-privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-400" data-testid="text-copyright">
            © {new Date().getFullYear()} Lendgismo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition" data-testid="link-footer-terms">Terms</a>
            <a href="#" className="hover:text-white transition" data-testid="link-footer-privacy-link">Privacy</a>
            <a href="#" className="hover:text-white transition" data-testid="link-footer-license">License</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
