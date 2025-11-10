import type React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeaturedDemos from "@/components/FeaturedDemos";
import SiteLogo from "@/components/SiteLogo";
import StickyCTA from "@/components/StickyCTA";
import TrustBelt from "@/components/TrustBelt";
import CompareTable from "@/components/CompareTable";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import IntegrationsShowcase from "@/components/IntegrationsShowcase";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Package, BookOpen, Database, Handshake } from "lucide-react";
import Seo from "@/components/Seo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Overview() {

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
      <Seo 
        title="Overview — Lendgismo Lending Platform Codebase"
        description="Deep dive into Lendgismo’s production‑ready lending platform: full source, RBAC, CSV onboarding, analytics, and integrations (Plaid, Stripe, Twilio, SendGrid)."
        url="https://lendgismo.com/overview"
        image="/assets/showcase/20251023-0938/02_dashboard--desktop.png"
      />
      <Navigation />

      {/* Overview Hero */}
  <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
            <Link href="/" className="hover:text-white transition" data-testid="link-breadcrumb-home">
              Home
            </Link>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white" data-testid="text-breadcrumb-current">Overview</span>
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-overview-heading">
              Lendgismo Platform <br/>
              <span className="text-gradient">Complete Overview</span>
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed" data-testid="text-overview-description">
              Production‑ready lending platform foundation. You get full source code, docs & diagrams, demo data, and a
              live handoff—plus multi‑tenant RBAC, CSV onboarding, analytics, and first‑class integrations (Plaid,
              Stripe, Twilio, SendGrid). Deploy anywhere: AWS, Azure, Google Cloud, or any modern cloud platform.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
  <section id="roi" className="py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-tech-heading">Technology Stack</h2>
            <p className="text-lg text-zinc-300" data-testid="text-tech-description">Built with modern, battle-tested technologies for scalability and developer experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Frontend', items: ['• Next.js 14 (App Router)', '• React 18', '• TypeScript', '• Tailwind CSS'] },
              { title: 'UI Components', items: ['• shadcn/ui patterns', '• Radix UI primitives', '• Lucide icons', '• Class Variance Authority'] },
              { title: 'Forms & Data', items: ['• React Hook Form', '• Zod validation', '• Date-fns utilities', '• CSV parsing'] },
              { title: 'Deployment', items: ['• AWS, Azure, GCP ready', '• Docker & Kubernetes support', '• Self-hosted or cloud', '• CI/CD compatible'] },
            ].map((stack, index) => (
              <div key={index} className="card" data-testid={`card-stack-${index}`}>
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2" data-testid={`text-stack-title-${index}`}>{stack.title}</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  {stack.items.map((item, i) => (
                    <li key={i} data-testid={`text-stack-item-${index}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* STUNNING HERO VIDEO SECTION */}
  <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/50 via-brand-900/30 to-brand-950/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Elegant brand intro with enhanced styling */}
          <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150"></div>
              <SiteLogo size={120} glow className="opacity-95 relative animate-float" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 text-center leading-tight">
              See The Platform
              <br />
              <span className="text-gradient bg-gradient-to-r from-brand-400 via-brand-300 to-brand-500 bg-clip-text text-transparent">
                In Action
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-zinc-300 text-center max-w-4xl leading-relaxed mb-4">
              Experience the complete platform walkthrough — from dashboard analytics to borrower management, 
              applications, and comprehensive account settings.
            </p>
            
            <div className="flex items-center gap-2 text-brand-300 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Full demo</span>
            </div>
          </div>
          
          {/* ENHANCED Featured Demo Video - cinematic presentation */}
          <div className="relative max-w-6xl mx-auto">
            {/* Glow effect behind video - positioned absolutely, doesn't interfere with clicks */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-brand-400/20 to-brand-500/20 rounded-3xl blur-2xl opacity-50 pointer-events-none"></div>
            
            {/* Video container with premium styling - FIXED for smooth playback */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-2 md:p-3 backdrop-blur-sm shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner">
                {/* Removed the play button overlay that was blocking clicks */}
                <div className="aspect-[16/9] bg-gradient-to-br from-brand-950 to-black">
                  <FeaturedDemos variant="hero" maxVideos={1} className="!py-0" />
                </div>
              </div>
            </div>

            {/* Video description below */}
            <div className="text-center mt-6 space-y-3">
              <div className="flex items-center justify-center gap-6 text-sm md:text-base">
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle size={18} className="text-brand-400" />
                  <span>Full HD Quality</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle size={18} className="text-brand-400" />
                  <span>No Login Required</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle size={18} className="text-brand-400" />
                  <span>Complete Walkthrough</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Hero - Stunning Value Proposition */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="relative rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-950/60 via-brand-900/40 to-brand-950/60 overflow-hidden shadow-2xl">
              {/* Animated gradient orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <div className="relative p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs uppercase tracking-wide text-brand-300 backdrop-blur mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></div>
                    <span>Proven ROI for Lenders</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Stop Burning <span className="text-gradient">$300k–$500k</span> on Custom Dev
                  </h3>
                  <p className="text-lg text-zinc-300 max-w-3xl mx-auto">
                    Building a lending platform from scratch drains budgets and delays launch. 
                    Get production-ready code <strong className="text-white">today</strong> and deploy in weeks.
                  </p>
                </div>

                {/* Cost Breakdown Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Build In-House */}
                  <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 backdrop-blur">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L3 17H17L10 3Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 8V12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="10" cy="14.5" r="0.5" fill="#ef4444"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Build In-House</h4>
                        <p className="text-xs text-red-400">Traditional approach</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">2 Senior Engineers × 6 months</span>
                        <span className="text-white font-semibold">$240k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Product Manager × 4 months</span>
                        <span className="text-white font-semibold">$80k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Designer × 3 months</span>
                        <span className="text-white font-semibold">$60k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">QA & DevOps setup</span>
                        <span className="text-white font-semibold">$40k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Integration costs (Plaid, Stripe)</span>
                        <span className="text-white font-semibold">$30k</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-red-500/20">
                      <div className="flex justify-between items-baseline">
                        <span className="text-white font-semibold">Total Cost</span>
                        <span className="text-2xl font-bold text-red-400">$450k+</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">+ 6 months time to market</p>
                    </div>
                  </div>

                  {/* Get Lendgismo */}
                  <div className="relative rounded-2xl border-2 border-brand-500/50 bg-gradient-to-br from-brand-500/20 to-brand-600/10 p-6 backdrop-blur">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-glow">
                      SAVE $300k+
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-500/30 flex items-center justify-center">
                        <CheckCircle size={20} className="text-brand-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Get Lendgismo</h4>
                        <p className="text-xs text-brand-300">Smart investment</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Perpetual code license</span>
                        <span className="text-white font-semibold">$150k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Customization (2–4 weeks)</span>
                        <span className="text-white font-semibold">$20–40k</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Live handoff + docs</span>
                        <span className="text-brand-300 font-semibold">Included</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Deploy-ready infrastructure</span>
                        <span className="text-brand-300 font-semibold">Day 1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">All integrations pre-built</span>
                        <span className="text-brand-300 font-semibold">Ready</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-brand-500/30">
                      <div className="flex justify-between items-baseline">
                        <span className="text-white font-semibold">Total Investment</span>
                        <span className="text-2xl font-bold text-gradient">$150–190k</span>
                      </div>
                      <p className="text-xs text-brand-300 mt-1">Launch in 4–6 weeks</p>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA & Stats */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gradient">$600k+</div>
                      <div className="text-xs text-zinc-400 mt-1">You Save</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">3–5x</div>
                      <div className="text-xs text-zinc-400 mt-1">ROI</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">6 mo.</div>
                      <div className="text-xs text-zinc-400 mt-1">Faster</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <div className="text-3xl font-bold text-white">1,800+</div>
                          <div className="text-xs text-zinc-400 mt-1">Dev hours saved</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm">
                        <p>
                          Estimate: 2 senior engineers × 6 months × ~150 hrs/month ≈ 1,800 hours.
                        </p>
                        <p className="text-zinc-400 mt-1">
                          Excludes PM, design, QA/DevOps, and third‑party integrations.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="h-12 w-px bg-white/10"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">12+</div>
                      <div className="text-xs text-zinc-400 mt-1">Sprints saved</div>
                    </div>
                  </div>
                  <a 
                    href="#contact" 
                    className="btn-primary text-lg px-8 py-4 whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-xl hover:shadow-brand-500/40 transition-all"
                  >
                    Get Started Now
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* What You Get - premium card grid */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { 
                title: 'Complete Source Code', 
                desc: 'Full Next.js/React app with TypeScript',
                icon: <Package className="w-6 h-6 text-brand-300" />
              },
              { 
                title: 'Docs & Diagrams', 
                desc: 'Architecture guides and API docs',
                icon: <BookOpen className="w-6 h-6 text-brand-300" />
              },
              { 
                title: 'Demo Data Sets', 
                desc: 'Realistic sample data included',
                icon: <Database className="w-6 h-6 text-brand-300" />
              },
              { 
                title: 'Live Handoff', 
                desc: 'Team walkthrough session',
                icon: <Handshake className="w-6 h-6 text-brand-300" />
              },
            ].map((it, i) => (
              <div 
                key={i} 
                className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 hover:border-brand-400/50 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="mb-3 relative group/icon">
                  <div className="absolute -inset-2 rounded-2xl bg-brand-500/20 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-12 h-12 rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-500/20 to-brand-400/10 flex items-center justify-center shadow-inner">
                    {it.icon}
                  </div>
                </div>
                <div className="text-white font-bold text-lg mb-2">{it.title}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust belt / integrations */}
      <TrustBelt />

  {/* Integrations ROI showcase */}
  <IntegrationsShowcase />

      {/* Screenshot Gallery removed as requested */}

    {/* Features Deep Dive */}
  <section id="features" className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-capabilities-heading">Key Capabilities</h2>
            <p className="text-lg text-zinc-300" data-testid="text-capabilities-description">Detailed breakdown of platform features and functionality</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                title: 'Timeframe Master Controls',
                description: 'Centralized date range management that synchronizes across all charts, tables, and reports. Users can select custom date ranges or use presets (Last 7 Days, Last Month, YTD, etc.) that instantly update all data visualizations.',
                tags: ['Global state management', 'Preset date ranges', 'Custom date picker']
              },
              {
                title: 'Comprehensive CSV Onboarding',
                description: 'Import banking transactions, inventory data, and customer information via CSV files. The wizard validates data formats, catches errors, shows preview tables, and provides detailed feedback before committing. Supports multiple file types and custom field mapping.',
                tags: ['Schema validation', 'Field mapping', 'Error reporting']
              },
              {
                title: 'Multi-Tenant RBAC Architecture',
                description: 'Separate portals for borrowers, brokers, and administrators with granular permission controls. Each role has customized dashboards, workflows, and data access. Supports team hierarchies, delegation, and audit trails for compliance.',
                tags: ['Role-based access', 'Audit logging', 'Tenant isolation']
              }
            ].map((feature, index) => (
              <div key={index} className="card" data-testid={`card-capability-${index}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" stroke="#5b8cff" strokeWidth="2"/>
                      <path d="M16 10V16L20 20" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-3" data-testid={`text-capability-title-${index}`}>{feature.title}</h3>
                    <p className="text-zinc-300 mb-4" data-testid={`text-capability-description-${index}`}>{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs text-brand-300"
                          data-testid={`badge-capability-tag-${index}-${i}`}
                        >
                          <CheckCircle size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Compare table */}
  <CompareTable />

  {/* Pricing section */}
  <Pricing />

      {/* Implementation Details */}
      <section className="py-14 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-package-heading">What You Get</h2>
            <p className="text-lg text-zinc-300" data-testid="text-package-description">Complete package for rapid deployment</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Complete Source Code', description: 'Full Next.js application with all components, utilities, and configurations' },
              { title: 'Documentation', description: 'Setup guides, architecture diagrams, API docs, and deployment instructions' },
              { title: 'Demo Data Sets', description: 'Sample tenants, users, loans, and transactions for testing and development' },
              { title: 'Handoff Session', description: 'Live walkthrough with your team covering architecture, customization, and deployment' }
            ].map((item, index) => (
              <div key={index} className="card" data-testid={`card-package-${index}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7L10 3L17 7L10 11L3 7Z" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 13L10 17L17 13" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 10L10 14L17 10" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2" data-testid={`text-package-title-${index}`}>{item.title}</h3>
                    <p className="text-sm text-zinc-300" data-testid={`text-package-description-${index}`}>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* FAQ */}
    <FAQ />

    {/* CTA Section */}
  <section id="contact" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-cta-heading">
            Ready to accelerate your <span className="text-gradient">development timeline?</span>
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-2xl mx-auto" data-testid="text-cta-description">
            Get started with Lendgismo today and launch your lending platform in weeks instead of months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact" className="btn-primary" data-testid="button-cta-handoff" title="ZIP via Google Drive/WeTransfer/S3, or GitHub access—your choice">
              Request ZIP Handoff
              <ArrowRight size={20} />
            </Link>
            <Link href="/#pricing" className="btn-ghost" data-testid="button-cta-pricing">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <StickyCTA />
    </div>
  );
}
