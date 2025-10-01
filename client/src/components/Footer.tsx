import { Link } from "wouter";

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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" fill="#0f1c4a"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">Lendgismo</div>
                <div className="text-brand-400 text-xs font-semibold">Lendgismo</div>
              </div>
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
              <li><a href="#" className="hover:text-white transition" data-testid="link-footer-blog">Blog</a></li>
              <li><a href="#" className="hover:text-white transition" data-testid="link-footer-careers">Careers</a></li>
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
