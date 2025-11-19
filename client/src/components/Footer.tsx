import type React from 'react'
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
              Production‑ready lending platform foundation. Full source code, docs & diagrams, demo data, and a live
              handoff. Multi‑tenant RBAC, CSV onboarding, analytics, and first‑class integrations (Plaid, Stripe,
              Twilio, SendGrid). Deploy anywhere: AWS, Azure, Google Cloud, or any modern cloud platform.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a
                  href="https://platform.lendgismo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                  data-testid="link-footer-platform"
                >
                  Try the App
                </a>
              </li>
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
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" data-testid="link-footer-documentation">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => scrollToSection(e, '#contact')} className="hover:text-white transition" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="/legal/privacy" className="hover:text-white transition" data-testid="link-footer-privacy">Privacy</a></li>
              <li><a href="/legal/privacy-choices" className="hover:text-white transition" data-testid="link-footer-privacy-choices">Your Privacy Choices</a></li>
              <li><a href="/legal/terms" className="hover:text-white transition" data-testid="link-footer-terms-menu">Terms</a></li>
              <li><a href="/legal/license" className="hover:text-white transition" data-testid="link-footer-license-menu">License</a></li>
              <li><a href="/legal/dmca" className="hover:text-white transition" data-testid="link-footer-dmca">DMCA</a></li>
              <li><a href="/legal/dpa" className="hover:text-white transition" data-testid="link-footer-dpa">DPA</a></li>
              <li><a href="/legal/cookies" className="hover:text-white transition" data-testid="link-footer-cookies">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-400" data-testid="text-copyright">
            © {new Date().getFullYear()} Lendgismo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a href="/legal/terms" className="hover:text-white transition" data-testid="link-footer-terms">Terms</a>
            <a href="/legal/privacy" className="hover:text-white transition" data-testid="link-footer-privacy-link">Privacy</a>
            <a href="/legal/privacy-choices" className="hover:text-white transition" data-testid="link-footer-privacy-choices-inline">Your Privacy Choices</a>
            <a href="/legal/license" className="hover:text-white transition" data-testid="link-footer-license">License</a>
            <a href="/legal/dmca" className="hover:text-white transition" data-testid="link-footer-dmca-inline">DMCA</a>
            <a href="/legal/dpa" className="hover:text-white transition" data-testid="link-footer-dpa-inline">DPA</a>
            <a href="/legal/cookies" className="hover:text-white transition" data-testid="link-footer-cookies-inline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
