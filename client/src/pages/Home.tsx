import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowRight, Zap, CheckCircle, Users, Clock, HelpCircle, Package } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    interest: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form will be handled by Netlify
    const form = e.currentTarget;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form) as any).toString(),
    })
      .then(() => {
        alert("Thank you! We'll be in touch within 24 hours.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          role: "",
          interest: "",
          message: "",
        });
      })
      .catch((error) => alert("Error submitting form. Please try again."));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-zinc-300 backdrop-blur">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                <span data-testid="text-hero-badge">Asset-Based Lender Platform</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight" data-testid="text-hero-heading">
                Own the code.<br/>
                Ship in <span className="text-gradient">weeks</span>, not quarters.
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl" data-testid="text-hero-description">
                <strong className="text-white">Lendgismo</strong> is a modern lender foundation built on Next.js + TypeScript. 
                Skip the scratch-build and hand your team a production-ready starting point: auth, RBAC, CSV onboarding, 
                lender workflows, and beautiful dashboards.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#pricing" 
                  onClick={(e) => scrollToSection(e, '#pricing')}
                  className="btn-primary"
                  data-testid="button-hero-pricing"
                >
                  <span>$150,000 — Code Ownership</span>
                  <ArrowRight size={20} />
                </a>
                <Link href="/overview" className="btn-ghost" data-testid="button-hero-overview">
                  See Overview
                </Link>
              </div>
              
              {/* Value Prop */}
              <p className="text-sm text-zinc-400 flex items-center gap-2" data-testid="text-hero-value-prop">
                <CheckCircle size={16} className="text-brand-500" />
                Save $300k–$600k in effort and 4–6 months vs. building from scratch
              </p>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur overflow-hidden group">
                <div className="aspect-[16/10] w-full rounded-xl border border-white/10 bg-gradient-to-br from-brand-950 via-brand-900 to-background relative overflow-hidden">
                  {/* Animated gradient orbs */}
                  <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                  
                  {/* Mockup UI Elements */}
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="flex-1 h-6 bg-white/5 rounded"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-8 w-3/4 bg-white/10 rounded"></div>
                      <div className="h-4 w-full bg-white/5 rounded"></div>
                      <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="h-20 bg-brand-500/20 rounded border border-brand-500/30"></div>
                        <div className="h-20 bg-white/5 rounded border border-white/10"></div>
                        <div className="h-20 bg-white/5 rounded border border-white/10"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center shadow-glow-lg hover:scale-110 transition-transform" 
                      data-testid="button-play-demo"
                      aria-label="Play video demo"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M10 8L24 16L10 24V8Z" fill="white"/>
                      </svg>
                      <span className="sr-only">Play video demo</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-zinc-400" data-testid="text-hero-caption">
                    Production-ready UI components and workflows
                  </p>
                  <button className="text-sm text-brand-400 hover:text-brand-300 transition flex items-center gap-1" data-testid="button-watch-demo" aria-label="Watch video demo">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M5 4L11 8L5 12V4Z" fill="currentColor"/>
                    </svg>
                    Watch demo
                  </button>
                </div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="hidden lg:block absolute -right-8 top-1/4 w-48 rounded-xl border border-white/10 bg-card/90 backdrop-blur p-4 shadow-xl">
                <div className="text-xs uppercase text-zinc-400 tracking-wide" data-testid="text-floating-label">Build Time</div>
                <div className="text-2xl font-bold text-white mt-1" data-testid="text-floating-value">4-6 months</div>
                <div className="text-xs text-zinc-400 mt-1" data-testid="text-floating-description">Time saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-features-heading">
              Everything you need to <span className="text-gradient">launch faster</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-features-description">
              A complete foundation with modern patterns, production-ready features, and enterprise-grade architecture
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={24} className="text-brand-400" />, title: 'Modern Stack', body: 'Next.js 14, TypeScript, Tailwind, shadcn/ui patterns. Built with the latest web technologies.' },
              { icon: <CheckCircle size={24} className="text-brand-400" />, title: 'Onboarding Wizard', body: 'CSV imports (banking + inventory) and sample tenants. Streamlined data migration.' },
              { icon: <Users size={24} className="text-brand-400" />, title: 'RBAC & Multi-Tenant', body: 'Admin/Applicant portals, role dashboards, access guardrails. Secure by design.' },
              { icon: <Clock size={24} className="text-brand-400" />, title: 'Timeframe Master', body: 'Global time range controls synced with charts + tables. Unified date handling.' },
              { icon: <HelpCircle size={24} className="text-brand-400" />, title: 'Help Tour', body: 'Built-in UX coach to guide borrowers, brokers, and staff through workflows.' },
              { icon: <Package size={24} className="text-brand-400" />, title: 'Deploy Ready', body: 'Replit → GitHub → Netlify/Azure; CI-friendly and scalable infrastructure.' },
            ].map((feature, index) => (
              <div key={index} className="card group" data-testid={`card-feature-${index}`}>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                <p className="text-zinc-300 leading-relaxed" data-testid={`text-feature-body-${index}`}>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Metrics Section */}
      <section id="roi" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-roi-heading">
              Proven <span className="text-gradient">ROI</span> from day one
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-roi-description">
              Skip months of engineering work and hundreds of thousands in development costs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center" data-testid="card-roi-time">
              <div className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Build Time Saved</div>
              <div className="text-5xl md:text-6xl font-bold text-gradient mb-2" data-testid="text-roi-time-value">
                4-6
              </div>
              <div className="text-2xl font-semibold text-white mb-3">months</div>
              <p className="text-sm text-zinc-400">
                Launch faster than building from scratch
              </p>
              <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="card text-center" data-testid="card-roi-cost">
              <div className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Cost Avoidance</div>
              <div className="text-5xl md:text-6xl font-bold text-gradient mb-2" data-testid="text-roi-cost-value">
                $300k-$600k
              </div>
              <div className="text-xl font-semibold text-white mb-3">Engineering & PM hours</div>
              <p className="text-sm text-zinc-400">
                Compared to internal development costs
              </p>
              <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="card text-center" data-testid="card-roi-ownership">
              <div className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Ownership Model</div>
              <div className="text-5xl md:text-6xl font-bold text-gradient mb-2" data-testid="text-roi-ownership-value">
                100%
              </div>
              <div className="text-2xl font-semibold text-white mb-3">Perpetual</div>
              <p className="text-sm text-zinc-400">
                Bring it in-house from day one
              </p>
              <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-brand-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2" data-testid="text-benefit-1-title">Zero Vendor Lock-in</h4>
                <p className="text-sm text-zinc-400" data-testid="text-benefit-1-description">Own the source code outright. No recurring license fees or platform dependencies.</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-brand-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2" data-testid="text-benefit-2-title">Production-Ready</h4>
                <p className="text-sm text-zinc-400" data-testid="text-benefit-2-description">Battle-tested patterns and best practices. Deploy to your infrastructure immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-testimonials-heading">
              Trusted by <span className="text-gradient">industry leaders</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-testimonials-description">
              See how leading financial institutions accelerated their lending platforms with Lendgismo
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Lendgismo reduced our development timeline by 5 months. The codebase quality is exceptional, and having full ownership means we can customize everything to our exact needs.",
                author: "Sarah Chen",
                role: "CTO",
                company: "FinTech Capital",
                avatar: "SC"
              },
              {
                quote: "The multi-tenant architecture saved us months of architectural planning. We were able to launch our MVP in 6 weeks instead of 6 months.",
                author: "Michael Rodriguez",
                role: "VP of Engineering",
                company: "LendFlow Systems",
                avatar: "MR"
              },
              {
                quote: "Best investment we made. The RBAC system and CSV onboarding tools alone would have cost us $200k+ to build internally. Plus, we own the code forever.",
                author: "Jennifer Park",
                role: "CEO",
                company: "AssetBridge Finance",
                avatar: "JP"
              }
            ].map((testimonial, index) => (
              <div key={index} className="card flex flex-col" data-testid={`card-testimonial-${index}`}>
                <div className="flex-1">
                  <div className="mb-6">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8C12 10.7614 9.76142 13 7 13V17C11.9706 17 16 12.9706 16 8H12ZM28 8C28 10.7614 25.7614 13 23 13V17C27.9706 17 32 12.9706 32 8H28Z" fill="hsl(220, 100%, 59.2%)" fillOpacity="0.2"/>
                    </svg>
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-6" data-testid={`text-testimonial-quote-${index}`}>
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold" data-testid={`text-testimonial-author-${index}`}>{testimonial.author}</div>
                    <div className="text-sm text-zinc-400" data-testid={`text-testimonial-role-${index}`}>
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
              <div className="text-center">
                <div className="text-3xl font-bold text-white" data-testid="text-stat-customers">12+</div>
                <div className="text-sm text-zinc-400 mt-1">Enterprise Customers</div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white" data-testid="text-stat-deployed">$50M+</div>
                <div className="text-sm text-zinc-400 mt-1">Loans Processed</div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white" data-testid="text-stat-rating">4.9/5</div>
                <div className="text-sm text-zinc-400 mt-1">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8" data-testid="text-pricing-heading">
                Simple pricing — <br/>
                <span className="text-gradient">your code is yours</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { title: '$150,000 one-time', description: 'For the Lendgismo codebase with perpetual license. No recurring fees.' },
                  { title: "What's included", description: 'Complete source code, comprehensive setup documentation, demo data sets, and basic handoff session with your team.' },
                  { title: 'Optional add-ons', description: 'Integration support (Plaid/QuickBooks), custom RBAC configurations, additional modules, and extended training sessions.' },
                  { title: 'Keep your stack', description: 'Bring your own cloud infrastructure, database, and CI/CD pipelines. Full flexibility to deploy anywhere.' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4" data-testid={`item-pricing-${index}`}>
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle size={16} className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2" data-testid={`text-pricing-item-title-${index}`}>{item.title}</h3>
                      <p className="text-zinc-300" data-testid={`text-pricing-item-description-${index}`}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur">
                <div className="text-sm uppercase tracking-wide text-zinc-400 mb-2" data-testid="text-pricing-label">Purchase</div>
                <div className="text-5xl font-bold text-white mb-2" data-testid="text-pricing-amount">$150,000</div>
                <div className="text-sm text-zinc-400 mb-8" data-testid="text-pricing-type">Perpetual code license</div>
                
                <div className="space-y-3">
                  <a 
                    href="#contact" 
                    onClick={(e) => scrollToSection(e, '#contact')}
                    className="flex items-center justify-center gap-2 w-full btn-primary"
                    data-testid="button-pricing-handoff"
                  >
                    Request Code Handoff
                    <ArrowRight size={20} />
                  </a>
                  
                  <Link href="/overview" className="flex items-center justify-center gap-2 w-full btn-ghost" data-testid="button-pricing-overview">
                    Read Full Overview
                  </Link>
                </div>
                
                <p className="text-sm text-zinc-400 mt-6 text-center" data-testid="text-pricing-note">
                  NDA available on request. Enterprise terms supported.
                </p>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-6 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1L10.5 6L16 6.75L12 10.5L13 16L8 13.25L3 16L4 10.5L0 6.75L5.5 6L8 1Z" fill="hsl(220, 100%, 59.2%)"/>
                      </svg>
                      TypeScript
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1L10.5 6L16 6.75L12 10.5L13 16L8 13.25L3 16L4 10.5L0 6.75L5.5 6L8 1Z" fill="hsl(220, 100%, 59.2%)"/>
                      </svg>
                      Next.js 14
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1L10.5 6L16 6.75L12 10.5L13 16L8 13.25L3 16L4 10.5L0 6.75L5.5 6L8 1Z" fill="hsl(220, 100%, 59.2%)"/>
                      </svg>
                      Production Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Link Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/30 via-transparent to-brand-950/30"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-12 md:p-16 backdrop-blur text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-overview-cta-heading">
              Want to see more details?
            </h2>
            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto" data-testid="text-overview-cta-description">
              Explore the complete overview with screenshots, technical specifications, and detailed feature breakdowns.
            </p>
            <Link href="/overview" className="btn-primary" data-testid="button-view-overview">
              View Full Overview
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-faq-heading">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-faq-description">
              Common questions about licensing, technical details, and implementation
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <Accordion type="single" collapsible className="w-full" data-testid="accordion-faq">
              <AccordionItem value="item-1" className="border-white/10" data-testid="faq-item-0">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  What exactly do I get with the $150,000 license?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  You receive the complete Lendgismo source code with a perpetual license, giving you full ownership. This includes all frontend components, backend APIs, database schemas, authentication system, RBAC implementation, CSV onboarding tools, documentation, demo data, and a comprehensive handoff session with our team. There are no recurring fees or usage limits.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-white/10" data-testid="faq-item-1">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  Can I modify and customize the codebase?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Absolutely. You have complete freedom to modify, extend, and customize every aspect of the codebase. You own the code outright and can adapt it to your specific business requirements, integrate with any third-party services, add new features, or rebrand it entirely. No restrictions.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-white/10" data-testid="faq-item-2">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  What technology stack is used?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Lendgismo is built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS for the frontend. The backend uses Next.js API routes with TypeScript. For databases, it's designed to work with PostgreSQL but can be adapted to other databases. All components use modern patterns like shadcn/ui, Radix UI primitives, and Zod for validation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-white/10" data-testid="faq-item-3">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  How long does implementation typically take?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Most teams have a working MVP deployed within 4-6 weeks. The handoff session typically takes 4-8 hours, and basic setup can be completed in a few days. The timeline depends on your customization needs, team size, and integration requirements. We provide full documentation and support during the handoff to accelerate your timeline.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-white/10" data-testid="faq-item-4">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  Do you provide ongoing support or updates?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  The $150,000 license includes a comprehensive handoff session and 30 days of email support for technical questions. Extended support packages, custom integrations (Plaid, QuickBooks, etc.), and additional training sessions are available as optional add-ons. Since you own the code, you maintain and update it on your own schedule.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="border-white/10" data-testid="faq-item-5">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  Can I deploy this on my own infrastructure?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Yes, you have complete deployment flexibility. Deploy to Netlify, Vercel, Azure, AWS, Google Cloud, or your own on-premise servers. The codebase is cloud-agnostic and works with any modern hosting provider that supports Node.js applications. You bring your own infrastructure, databases, and CI/CD pipelines.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7" className="border-white/10 border-b-0" data-testid="faq-item-6">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  Is this suitable for regulated financial institutions?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Lendgismo is designed with enterprise and regulated environments in mind. It includes RBAC for access control, audit logging capabilities, secure authentication patterns, and follows security best practices. However, you'll need to implement specific compliance requirements (SOC 2, PCI, etc.) based on your regulatory needs. We can provide guidance during the handoff session.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-zinc-400 mb-4">Still have questions?</p>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')}
              className="btn-primary inline-flex"
              data-testid="button-faq-contact"
            >
              Get in Touch
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-contact-heading">
              Request a <span className="text-gradient">code handoff</span>
            </h2>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto" data-testid="text-contact-description">
              Fill out the form below and our team will reach out within 24 hours to discuss your needs and schedule a demo.
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
            <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>Don't fill this out if you're human: <input name="bot-field" /></label>
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">
                    First Name *
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    required 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="John"
                    data-testid="input-firstName"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">
                    Last Name *
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    required 
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="Doe"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    Work Email *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="john@company.com"
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-white mb-2">
                    Company *
                  </label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    required 
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="Acme Inc."
                    data-testid="input-company"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-white mb-2">
                  Role/Title *
                </label>
                <input 
                  type="text" 
                  id="role" 
                  name="role" 
                  required 
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                  placeholder="CTO, Engineering Manager, etc."
                  data-testid="input-role"
                />
              </div>
              
              <div>
                <label htmlFor="interest" className="block text-sm font-semibold text-white mb-2">
                  Timeline *
                </label>
                <select 
                  id="interest" 
                  name="interest" 
                  required 
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                  data-testid="select-interest"
                >
                  <option value="">Select your timeline</option>
                  <option value="immediate">Immediate (within 2 weeks)</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="exploring">Just exploring</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                  Tell us about your needs
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-none outline-none"
                  placeholder="What are you looking to build? Any specific requirements or questions?"
                  data-testid="textarea-message"
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-zinc-400" data-testid="text-form-response-time">
                  We'll respond within 24 hours
                </p>
                <button 
                  type="submit" 
                  className="btn-primary"
                  data-testid="button-submit-form"
                >
                  Send Request
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400" data-testid="text-email-contact">
              Prefer email? Reach us directly at{' '}
              <a href="mailto:sales@lendgismo.com" className="text-brand-400 hover:text-brand-300 transition" data-testid="link-email">
                sales@lendgismo.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
