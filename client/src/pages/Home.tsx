import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import IntegrationsStatusBar from "@/components/IntegrationsStatusBar";
import { Link } from "wouter";
import { ArrowRight, Zap, CheckCircle, Users, Clock, HelpCircle, Package, Loader2, Landmark, CreditCard, MessageSquare, Mail, ShieldCheck, Building2, Workflow, FileSpreadsheet } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string>("");
  const successRef = useRef<HTMLDivElement>(null);

  const mirrorLeadEmail = async (payload: Record<string, string>) => {
    try {
      await fetch('/api/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Lead mirror email failed', err);
    }
  };

  const buildMailtoUrl = () => {
    const subject = `Lendgismo handoff request — ${formData.company || "No company"} (${formData.firstName} ${formData.lastName})`;
    const lines = [
      `Name: ${formData.firstName} ${formData.lastName}`,
      `Email: ${formData.email}`,
      `Company: ${formData.company}`,
      `Role: ${formData.role}`,
      `Phone: ${formData.phone || "(not provided)"}`,
      `Timeline: ${formData.interest || "(not provided)"}`,
      "",
      "Message:",
      formData.message || "(none)"
    ];
    // Use CRLF for broad client compatibility
    const body = lines.join("\r\n");
    const to = "brysen@lendgismo.com";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Primary: submit to Netlify Forms so the submission is always captured.
      // Netlify can email notifications from the Forms settings (no SendGrid dependency).
      const formEncoded = new URLSearchParams({
        'form-name': 'contact',
        'bot-field': '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
      }).toString();

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formEncoded,
      });

      if (!res.ok) {
        throw new Error(`Form submit failed (${res.status})`);
      }

      void mirrorLeadEmail({ formName: 'contact', ...formData });

      setLastEmail(formData.email);
      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", company: "", role: "", phone: "", interest: "", message: "" });
    } catch (err) {
      console.error("Form submit failed", err);
      setSubmitError("We couldn't send your request. Please try again or email brysen@lendgismo.com.");
    } finally {
      setSubmitting(false);
    }
  };



  
  useEffect(() => {
    if (submitted) {
      // Move focus to the success panel for accessibility
      successRef.current?.focus();
    }
  }, [submitted]);

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What exactly do I get with the $59,000 license?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You receive the complete Lendgismo source code with a perpetual license, including frontend components, backend APIs, database schemas, authentication, RBAC, CSV onboarding, documentation, demo data, and a comprehensive handoff session. There are no recurring fees or usage limits.",
        },
      },
      {
        "@type": "Question",
        name: "Can I modify and customize the codebase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You own the code outright and can modify, extend, and customize everything, including integrations, features, and branding.",
        },
      },
      {
        "@type": "Question",
        name: "What technology stack is used?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Next.js 14, React 18, TypeScript, and Tailwind CSS, with modern UI patterns and TypeScript API routes. PostgreSQL is the primary database target but can be adapted.",
        },
      },
      {
        "@type": "Question",
        name: "How long does implementation typically take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most teams deploy an MVP within 4-6 weeks. The handoff takes 4-8 hours, and basic setup can be completed in a few days.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide ongoing support or updates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The license includes a handoff session and 30 days of email support. Extended support packages are available on request.",
        },
      },
      {
        "@type": "Question",
        name: "Can I deploy this on my own infrastructure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Deploy to AWS, Azure, Google Cloud, or your own servers. The codebase is cloud-agnostic and works with modern hosting providers.",
        },
      },
      {
        "@type": "Question",
        name: "Is this suitable for regulated financial institutions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The platform includes RBAC, audit logging capabilities, and security best practices. You can add specific compliance requirements based on your regulatory needs.",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lendgismo Lending Platform Codebase",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Production-ready lending platform codebase with multi-tenant RBAC, Plaid, Stripe, credit bureaus (Experian, Equifax, TransUnion), CSV onboarding, and dashboards.",
    offers: {
      "@type": "Offer",
      price: "59000",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://lendgismo.com/",
    },
    brand: {
      "@type": "Brand",
      name: "Lendgismo",
    },
  };

  const integrationGroups = [
    {
      title: "Banking & Payments",
      description: "Move from application to funding with bank data, payment rails, and accounting sync already mapped out.",
      icon: Landmark,
      items: ["Plaid", "Stripe", "QuickBooks"],
      note: "Bank linking, payment collection, and finance reporting"
    },
    {
      title: "Automation & Messaging",
      description: "Trigger real-time borrower and ops workflows without custom glue code for every system.",
      icon: Workflow,
      items: ["Zapier", "Twilio", "SendGrid"],
      note: "Webhooks, SMS, email, CRM handoffs, and internal alerts"
    },
    {
      title: "Risk & Bureau Data",
      description: "Combine alternative data, fraud checks, and bureau signals to tighten underwriting and reduce manual review.",
      icon: ShieldCheck,
      items: ["DataMerch", "DecisionLogic", "Experian", "Equifax", "TransUnion"],
      note: "Credit, fraud, business data, and decision support"
    },
    {
      title: "Identity & Intake",
      description: "Support onboarding, KYC handoffs, and clean ingestion for lender workflows that need structured data from day one.",
      icon: FileSpreadsheet,
      items: ["Socure / Alloy", "CSV Upload & Onboarding"],
      note: "Identity verification hooks plus guided import flows"
    }
  ];

  const integrationTiles = [
    { name: "Plaid", label: "Banking", className: "from-sky-500/25 to-cyan-500/10 border-sky-400/30" },
    { name: "DataMerch", label: "Alt data", className: "from-blue-500/25 to-indigo-500/10 border-blue-400/30" },
    { name: "Stripe", label: "Payments", className: "from-violet-500/25 to-fuchsia-500/10 border-violet-400/30" },
    { name: "Zapier", label: "Automation", className: "from-orange-500/25 to-amber-500/10 border-orange-400/30" },
    { name: "Experian", label: "Bureau", className: "from-brand-500/25 to-sky-500/10 border-brand-400/30" },
    { name: "Equifax", label: "Bureau", className: "from-cyan-500/20 to-blue-500/10 border-cyan-400/30" },
    { name: "TransUnion", label: "Bureau", className: "from-indigo-500/20 to-slate-500/10 border-indigo-400/30" },
    { name: "Twilio", label: "SMS", className: "from-white/10 to-white/5 border-white/15" },
    { name: "SendGrid", label: "Email", className: "from-cyan-500/20 to-sky-500/10 border-cyan-400/30" },
    { name: "QuickBooks", label: "Accounting", className: "from-emerald-500/20 to-green-500/10 border-emerald-400/30" },
    { name: "DecisionLogic", label: "Fraud", className: "from-zinc-100/10 to-zinc-100/5 border-white/15" }
  ];

  const bureauProviders = [
    {
      name: "Experian",
      icon: ShieldCheck,
      blurb: "Business credit intelligence, entity verification, and underwriting signals for higher-confidence approvals.",
      bullets: ["Commercial credit profiles", "Identity and entity validation", "Policy-driven risk pulls"],
      className: "from-brand-500/20 via-brand-500/8 to-transparent border-brand-400/25"
    },
    {
      name: "Equifax",
      icon: Building2,
      blurb: "Commercial bureau data and public record context that help teams validate borrowers faster.",
      bullets: ["Commercial risk attributes", "Public records context", "Decision-ready summary payloads"],
      className: "from-cyan-500/18 via-cyan-500/8 to-transparent border-cyan-400/25"
    },
    {
      name: "TransUnion",
      icon: Landmark,
      blurb: "Fraud and verification signals designed for policy-based screening and cleaner decision workflows.",
      bullets: ["Fraud and identity indicators", "Threshold-based screening", "Fast mock and live-ready responses"],
      className: "from-indigo-500/18 via-indigo-500/8 to-transparent border-indigo-400/25"
    }
  ];

  return (
    <div className="min-h-screen">
      <Seo 
        title="Lendgismo — Lending Platform Codebase (React/TypeScript, RBAC, Plaid, Stripe, Credit Bureaus)"
        description="Own a production-ready lending platform codebase with Next.js/TypeScript, multi-tenant RBAC, Plaid/Stripe integrations, and credit bureaus (Experian, Equifax, TransUnion). Save $390k+ and deploy in 24 hours."
        url="https://lendgismo.com/"
        image="/assets/showcase/20251023-0938/01_home_app--desktop.png"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-zinc-300 backdrop-blur">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                <span data-testid="text-hero-badge">Asset-Based Lender Platform</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight" data-testid="text-hero-heading">
                Save <span className="text-gradient">$390k–$690k+</span><br/>
                and 6 months of dev time
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl" data-testid="text-hero-description">
                Get a complete, production-ready lender platform codebase <strong className="text-white">delivered instantly</strong>. 
                Next.js + TypeScript foundation with auth, RBAC, multi-tenant architecture, CSV onboarding, 
                and polished dashboards — ready for your dev team to deploy <em>today</em>.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#what-you-get" 
                  onClick={(e) => scrollToSection(e, '#what-you-get')}
                  className="btn-primary"
                  data-testid="button-hero-pricing"
                >
                  <span>See What You Get Instantly</span>
                  <ArrowRight size={20} />
                </a>
                <a href="/overview" className="btn-ghost" data-testid="button-hero-overview">
                  View Tech Details
                </a>
                <Link href="/docs" className="btn-ghost" data-testid="button-hero-docs">
                  Read the Docs
                </Link>
              </div>
              
              {/* Value Prop */}
              <div className="flex flex-col sm:flex-row gap-4">
                <p className="text-sm text-zinc-400 flex items-center gap-2" data-testid="text-hero-value-prop">
                  <CheckCircle size={16} className="text-brand-500" />
                  $59,000 one-time — Own the code forever
                </p>
                <p className="text-sm text-zinc-400 flex items-center gap-2" data-testid="text-hero-value-prop-2">
                  <CheckCircle size={16} className="text-brand-500" />
                  8x–13x ROI vs. building in-house
                </p>
                <p className="text-sm text-zinc-400 flex items-center gap-2" data-testid="text-hero-value-prop-3">
                  <CheckCircle size={16} className="text-brand-500" />
                  Docs included — run locally in minutes
                </p>
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative pb-16 md:pb-20">
              {/* Ambient glow */}
              <div className="absolute -inset-12 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none"></div>

              {/* ── Laptop-style dashboard frame ── */}
              <div className="relative animate-fade-in">
                {/* Bezel */}
                <div className="rounded-xl md:rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]">
                  {/* Top bar */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-t-[9px] md:rounded-t-[13px]">
                    <span className="h-[7px] w-[7px] rounded-full bg-red-500/70"></span>
                    <span className="h-[7px] w-[7px] rounded-full bg-yellow-500/70"></span>
                    <span className="h-[7px] w-[7px] rounded-full bg-green-500/70"></span>
                    <span className="ml-auto mr-auto text-[9px] text-zinc-500 font-medium tracking-wide">app.lendgismo.com/dashboard</span>
                  </div>
                  {/* Screen */}
                  <div className="overflow-hidden rounded-b-[9px] md:rounded-b-[13px]">
                    <img
                      src="/assets/showcase/dashboard-hero.png"
                      alt="Lendgismo admin dashboard — portfolio KPIs, originations chart, loan pipeline"
                      loading="eager"
                      decoding="async"
                      className="w-full h-auto block"
                      width={1440}
                      height={900}
                    />
                  </div>
                </div>
                {/* Stand / chin reflection */}
                <div className="mx-auto mt-0 h-[6px] w-[40%] rounded-b-lg bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-lg"></div>
              </div>

              {/* ── Right phone: Borrower Onboarding ── */}
              <div className="absolute -bottom-10 right-0 md:-right-4 w-[22%] md:w-[18%] animate-slide-in-right animate-float-after z-10">
                {/* Phone body */}
                <div className="rounded-[14px] md:rounded-[18px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.08)]">
                  {/* Notch */}
                  <div className="bg-zinc-900 rounded-t-[12px] md:rounded-t-[16px] flex items-center justify-center py-[3px]">
                    <div className="h-[3px] w-8 rounded-full bg-zinc-700"></div>
                  </div>
                  {/* Screen */}
                  <div className="overflow-hidden rounded-b-[12px] md:rounded-b-[16px] bg-white">
                    <img
                      src="/assets/showcase/20251023-0938/06_onboarding--mobile.png"
                      alt="Borrower onboarding — mobile loan application"
                      loading="eager"
                      decoding="async"
                      className="w-full h-auto block"
                      width={390}
                      height={844}
                    />
                  </div>
                </div>
                {/* Label */}
                <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]"></span>
                  Borrower
                </div>
              </div>

              {/* ── Left phone: Client Homepage ── */}
              <div className="absolute -bottom-8 left-0 md:-left-3 w-[20%] md:w-[16%] hidden md:block animate-slide-in-left animate-float-after z-10">
                {/* Phone body */}
                <div className="rounded-[14px] md:rounded-[18px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-[3px] shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
                  {/* Notch */}
                  <div className="bg-zinc-900 rounded-t-[12px] md:rounded-t-[16px] flex items-center justify-center py-[3px]">
                    <div className="h-[3px] w-7 rounded-full bg-zinc-700"></div>
                  </div>
                  {/* Screen */}
                  <div className="overflow-hidden rounded-b-[12px] md:rounded-b-[16px] bg-white">
                    <img
                      src="/assets/showcase/20251023-0938/01_home_app--mobile.png"
                      alt="LendPro borrower-facing homepage — mobile"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block"
                      width={390}
                      height={844}
                    />
                  </div>
                </div>
                {/* Label */}
                <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_4px_rgba(59,130,246,0.5)]"></span>
                  Client Site
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Day 1 Section */}
      <section id="what-you-get" className="py-12 md:py-16 bg-gradient-to-b from-brand-950/30 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-instant-heading">
              Complete codebase <span className="text-gradient">delivered instantly</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-instant-description">
              Everything your dev team needs to deploy a production-ready lending platform — available the moment you purchase
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { 
                title: '15,000+ Lines', 
                description: 'Production-tested TypeScript code',
                value: '15k+',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3L4 7L8 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M16 3L20 7L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              },
              { 
                title: '40+ Components', 
                description: 'shadcn/ui + custom UI library',
                value: '40+',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/></svg>
              },
              { 
                title: '3 Portal Types', 
                description: 'Admin, Borrower, Broker dashboards',
                value: '3',
                icon: <Users size={24} />
              },
              { 
                title: 'Full Auth + RBAC', 
                description: 'Complete security & permissions',
                value: '✓',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/></svg>
              },
            ].map((item, index) => (
              <div key={index} className="card text-center" data-testid={`card-instant-${index}`}>
                <div className="w-14 h-14 rounded-xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2" data-testid={`text-instant-value-${index}`}>{item.value}</div>
                <h3 className="text-white font-semibold mb-2" data-testid={`text-instant-title-${index}`}>{item.title}</h3>
                <p className="text-sm text-zinc-400" data-testid={`text-instant-description-${index}`}>{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Core Features (Ready to Use)</h3>
                <ul className="space-y-3">
                  {[
                    'Real-time banking data integration (Plaid-ready)',
                    'CSV onboarding wizard with validation',
                    'Multi-tenant architecture with tenant isolation',
                    'Role-based access control (RBAC) system',
                    'Authentication & session management',
                    'Global timeframe controls for reporting',
                    'Loan application workflow & status tracking',
                    'Document management & secure uploads',
                    'Notifications via SMS & email (Twilio/SendGrid-ready)',
                    'Payments & disbursements (Stripe-ready)',
                    'Audit logs & activity feed',
                    'Admin & tenant management tools',
                    'Search, filters, and pagination across datasets',
                    'Built-in rate limiting & error handling'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-core-${index}`}>
                      <CheckCircle size={20} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">What's Included</h3>
                <ul className="space-y-3">
                  {[
                    'Complete Next.js 14 source code',
                    'Database schemas & migration files',
                    'API routes & server-side logic',
                    'Deployment configurations for AWS, Azure, Google Cloud',
                    'Full technical documentation',
                    'Demo data & sample tenants'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-included-${index}`}>
                      <CheckCircle size={20} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <h4 className="text-white font-semibold mb-3">For Developers</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/docs/60_local-dev" className="text-brand-400 hover:text-brand-300" data-testid="link-dev-local">
                        Local Dev Guide →
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/50_api-quickstart" className="text-brand-400 hover:text-brand-300" data-testid="link-dev-api">
                        API Quickstart →
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/10_architecture" className="text-brand-400 hover:text-brand-300" data-testid="link-dev-arch">
                        Architecture Overview →
                      </Link>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Link href="/docs" className="btn-ghost" data-testid="button-view-docs">
                      View Documentation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-lg text-white mb-4">
                <strong>Delivery:</strong> Secure ZIP handoff within 24 hours (Google Drive, WeTransfer, or Amazon S3), or GitHub repository access — plus a live handoff session
              </p>
              <p className="text-sm text-zinc-400">
                Your dev team can start customizing and deploying immediately
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Band: ROI + Docs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">Ready to own your lender platform?</h3>
              <p className="text-sm text-zinc-400">See the ROI breakdown or dive into the docs. You can launch in weeks, not months.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/contact" onClick={(e) => scrollToSection(e, '#contact')} className="btn-primary" data-testid="button-band-handoff" title="Secure handoff via Google Drive, WeTransfer, S3, or GitHub access—your choice">
                Request Handoff
              </a>
              <a href="#roi" onClick={(e) => scrollToSection(e, '#roi')} className="btn-ghost" data-testid="button-band-roi">
                See ROI Breakdown
              </a>
              <Link href="/docs" className="btn-ghost" data-testid="button-band-docs">
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Section */}
      <section id="features" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-features-heading">
              Built-in capabilities that <span className="text-gradient">save months</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-features-description">
              Complex features that would take your team months to build are already complete and battle-tested.
              Ideal for an MCA lending software codebase, SMB alternative lender platform, or tribal lender deployment-ready build.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={24} className="text-brand-400" />, title: 'Real-Time Banking Data', body: 'Live financial data integration with Plaid, MX, or any banking aggregator. Transaction syncing, balance monitoring, and account verification built-in.' },
              { icon: <Users size={24} className="text-brand-400" />, title: 'Multi-Tenant Architecture', body: 'Complete tenant isolation with separate data, dashboards, and user management. Admin/Borrower/Broker portals built-in.' },
              { icon: <CheckCircle size={24} className="text-brand-400" />, title: 'CSV Onboarding System', body: 'Smart wizard for importing banking transactions and inventory data. Field mapping, validation, error handling, and preview built-in.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/></svg>, title: 'Enterprise RBAC', body: 'Granular role-based permissions with access policies, audit logging, and team hierarchies. Compliance-ready from day one.' },
              { icon: <Clock size={24} className="text-brand-400" />, title: 'Global Timeframe Controls', body: 'Master date range selector that syncs across all charts, tables, and reports. Custom ranges and presets included.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2"/><path d="M9 3V21" stroke="currentColor" strokeWidth="2"/><path d="M3 9H21" stroke="currentColor" strokeWidth="2"/><path d="M3 15H21" stroke="currentColor" strokeWidth="2"/></svg>, title: 'Responsive Dashboards', body: 'Analytics dashboards with charts, KPIs, and data tables. Dark mode, mobile-responsive, and fully accessible.' },
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <span>Explore docs:</span>
            <Link href="/docs/12_rbac-matrix" className="text-brand-400 hover:text-brand-300">
              RBAC implementation →
            </Link>
            <span className="text-zinc-500">•</span>
            <Link href="/docs/borrower-onboarding-preview" className="text-brand-400 hover:text-brand-300">
              CSV onboarding →
            </Link>
            <span className="text-zinc-500">•</span>
            <Link href="/docs/40_integrations" className="text-brand-400 hover:text-brand-300">
              Integrations overview →
            </Link>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start mb-8">
            <div className="max-w-3xl">
              <div className="badge mb-4">Integration-ready stack</div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Put your <span className="text-gradient">integrations front and center</span>
              </h2>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Lendgismo already supports the buyer-facing integrations lenders ask about most: banking, payments, CRM automation, SMS, email, accounting, alternative data, fraud checks, bureau pulls, identity workflows, and CSV onboarding.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">11 named providers</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">4 integration categories</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Docs + demo endpoints included</span>
              </div>
              <IntegrationsStatusBar />
            </div>

            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_40%)]"></div>
              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3">
                {integrationTiles.map((tile) => (
                  <div key={tile.name} className={`rounded-2xl border bg-gradient-to-br p-3 sm:p-4 ${tile.className}`}>
                    <div className="text-sm sm:text-base font-semibold text-white">{tile.name}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-300/80 mt-2">{tile.label}</div>
                  </div>
                ))}
              </div>
              <p className="relative mt-4 text-center text-sm text-zinc-300">
                Plus credit bureaus, identity providers, and data onboarding flows built to match the same lender workflow.
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_30%)]"></div>
            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
              <div className="max-w-2xl">
                <div className="badge mb-4">Credit bureau coverage</div>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                  Experian, Equifax, and <span className="text-gradient">TransUnion built in</span>
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Bureau integrations are surfaced as premium capabilities, not footnotes. Buyers can see immediately that the platform supports commercial credit pulls, verification signals, and risk workflows across the major bureaus.
                </p>
              </div>
              <Link href="/docs/40_integrations#credit-bureaus" className="btn-ghost w-fit">
                View Bureau Details
              </Link>
            </div>

            <div className="relative grid md:grid-cols-3 gap-5">
              {bureauProviders.map((provider) => (
                <div key={provider.name} className={`rounded-[1.75rem] border bg-gradient-to-br p-6 ${provider.className}`}>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-5">
                    <provider.icon size={22} />
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-xl font-semibold text-white">{provider.name}</h4>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">Bureau</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">{provider.blurb}</p>
                  <div className="space-y-2">
                    {provider.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-2 text-sm text-zinc-200">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-300"></span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {integrationGroups.map((group) => (
              <div key={group.title} className="card h-full">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-300 mb-5">
                  <group.icon size={22} />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{group.title}</h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">{group.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{group.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">Everything buyers need to evaluate in one place</h3>
              <p className="text-sm md:text-base text-zinc-400 mt-2">
                The homepage now surfaces every major integration currently documented across the platform instead of only a partial subset.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/docs/40_integrations" className="btn-primary">
                Review All Integrations
              </Link>
              <Link href="/docs/demo/integrations" className="btn-ghost">
                Open Demo Endpoints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Comparison Section */}
      <section id="roi" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-roi-heading">
              The math is simple: <span className="text-gradient">Save $390k–$690k+</span>
            </h2>
            <p className="text-lg text-zinc-300" data-testid="text-roi-description">
              See exactly how much your team saves by purchasing vs. building from scratch
            </p>
          </div>
          
          {/* Comparison Table */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Build from Scratch */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-8 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Build from Scratch</h3>
                <span className="text-sm uppercase tracking-wide text-red-400 bg-red-500/10 px-3 py-1 rounded-full">Expensive</span>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Senior Engineers (2)</span>
                  <span className="text-white font-semibold">$180/hr × 1,500 hrs</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Product Manager</span>
                  <span className="text-white font-semibold">$150/hr × 800 hrs</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Designer</span>
                  <span className="text-white font-semibold">$120/hr × 400 hrs</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Timeline</span>
                  <span className="text-white font-semibold">6-8 months</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg text-white font-semibold">Total Cost:</span>
                  <span className="text-3xl font-bold text-red-400">$450k–$750k</span>
                </div>
                <p className="text-sm text-zinc-400">Plus opportunity cost of delayed launch</p>
              </div>
            </div>
            
            {/* Buy Lendgismo */}
            <div className="rounded-2xl border border-brand-500/40 bg-brand-950/20 p-8 backdrop-blur relative">
              <div className="absolute -top-4 -right-4 bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-glow">Best Value</div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Get Lendgismo</h3>
                <span className="text-sm uppercase tracking-wide text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">Smart</span>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Lendgismo License</span>
                  <span className="text-white font-semibold">$59,000 one-time</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Customization (est.)</span>
                  <span className="text-white font-semibold">2-4 weeks</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Deployment</span>
                  <span className="text-white font-semibold">Ready day 1</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400">Timeline</span>
                  <span className="text-white font-semibold">4-6 weeks</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg text-white font-semibold">Total Cost:</span>
                  <span className="text-3xl font-bold text-gradient">$59k</span>
                </div>
                <p className="text-sm text-brand-300">6 months faster to market</p>
              </div>
            </div>
          </div>
          
          {/* Savings Highlight */}
          <div className="text-center">
            <div className="inline-flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
              <div>
                <div className="text-sm uppercase text-zinc-400 mb-1">You Save</div>
                <div className="text-4xl md:text-5xl font-bold text-gradient">$690k+</div>
              </div>
              <div className="h-16 w-px bg-white/10"></div>
              <div>
                <div className="text-sm uppercase text-zinc-400 mb-1">ROI</div>
                <div className="text-4xl md:text-5xl font-bold text-white">3x–5x</div>
              </div>
              <div className="h-16 w-px bg-white/10"></div>
              <div>
                <div className="text-sm uppercase text-zinc-400 mb-1">Time Saved</div>
                <div className="text-4xl md:text-5xl font-bold text-white">6 months</div>
              </div>
              <div className="h-16 w-px bg-white/10"></div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <div className="text-sm uppercase text-zinc-400 mb-1">Dev Hours Saved</div>
                    <div className="text-4xl md:text-5xl font-bold text-white">1,800+</div>
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
              <div className="h-16 w-px bg-white/10"></div>
              <div>
                <div className="text-sm uppercase text-zinc-400 mb-1">Sprints Saved</div>
                <div className="text-4xl md:text-5xl font-bold text-white">12+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
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
          
          <div className="mt-10 text-center">
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
      <section id="pricing" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8" data-testid="text-pricing-heading">
                One price. <span className="text-gradient">Own it forever.</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { title: 'Simple one-time payment', description: 'Single payment for a perpetual license. Enterprise invoicing and PO supported.' },
                  { title: 'Everything included', description: 'Core integrations (Zapier, Plaid, Stripe, QuickBooks, credit bureaus: Experian, Equifax, TransUnion), white‑label deployment assistance, and a live training handoff are included.' },
                  { title: '30-day email support', description: 'Technical questions answered within 24 hours. Extended support packages available.' },
                  { title: 'NDA & IP assignment', description: 'We provide standard NDA and full intellectual property assignment documents upon request.' },
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
                <div className="text-5xl font-bold text-white mb-2" data-testid="text-pricing-amount">$59,000</div>
                <div className="text-sm text-zinc-400 mb-8" data-testid="text-pricing-type">Perpetual code license</div>
                <div className="text-sm text-brand-300 mb-6">30-day email support included</div>
                
                <div className="space-y-3">
                  <a 
                    href="#contact" 
                    onClick={(e) => scrollToSection(e, '#contact')}
                    className="flex items-center justify-center gap-2 w-full btn-primary"
                    data-testid="button-pricing-handoff"
                  >
                    Request Handoff
                    <ArrowRight size={20} />
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => scrollToSection(e, '#contact')}
                    className="flex items-center justify-center gap-2 w-full btn-ghost"
                    data-testid="button-pricing-live-call"
                  >
                    Book a Live Code Handoff Call
                  </a>
                  
                  <a href="/overview" className="flex items-center justify-center gap-2 w-full btn-ghost" data-testid="button-pricing-overview">
                    Read Full Overview
                  </a>
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
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/30 via-transparent to-brand-950/30"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-12 md:p-16 backdrop-blur text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-overview-cta-heading">
              Want to see more details?
            </h2>
            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto" data-testid="text-overview-cta-description">
              Explore the complete overview with screenshots, technical specifications, and detailed feature breakdowns.
            </p>
            <a href="/overview" className="btn-primary" data-testid="button-view-overview">
              View Full Overview
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
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
                  What exactly do I get with the $59,000 license?
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
                  The $59,000 license includes a comprehensive handoff session and 30 days of email support for technical questions. Core integrations (Zapier webhooks, Plaid, Stripe, QuickBooks, credit bureaus: Experian, Equifax, TransUnion) and the training handoff are included. If you need more help, extended support packages and customizations are available on request. Since you own the code, you maintain and update it on your own schedule.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="border-white/10" data-testid="faq-item-5">
                <AccordionTrigger className="text-white hover:text-brand-400 hover:no-underline">
                  Can I deploy this on my own infrastructure?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300">
                  Yes, you have complete deployment flexibility. Deploy to AWS, Azure, Google Cloud, or your own self-hosted servers. The codebase is cloud-agnostic and works with any modern hosting provider that supports Node.js applications. Includes Docker support and works with Kubernetes. You bring your own infrastructure, databases, and CI/CD pipelines.
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <span>Related docs:</span>
            <Link href="/docs/12_rbac-matrix" className="text-brand-400 hover:text-brand-300">
              RBAC matrix →
            </Link>
            <span className="text-zinc-500">•</span>
            <Link href="/docs/60_local-dev" className="text-brand-400 hover:text-brand-300">
              Local dev guide →
            </Link>
            <span className="text-zinc-500">•</span>
            <Link href="/docs/40_integrations" className="text-brand-400 hover:text-brand-300">
              Integrations →
            </Link>
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
      <section id="contact" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-contact-heading">
              Request a <span className="text-gradient">code handoff</span>
            </h2>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto" data-testid="text-contact-description">
              Fill out the form below and our team will reach out within 24 hours to discuss your needs and schedule a demo.
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">Prefer to skip the form?</p>
              <a href={buildMailtoUrl()} className="btn-ghost">Email us directly</a>
            </div>
            {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="Acme Inc."
                    data-testid="input-company"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
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
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="CTO, Engineering Manager, etc."
                    data-testid="input-role"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="interest" className="block text-sm font-semibold text-white mb-2">
                  Timeline *
                </label>
                <Select
                  value={formData.interest}
                  onValueChange={(v) => setFormData((p) => ({ ...p, interest: v }))}
                >
                  <SelectTrigger id="interest" className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select your timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (within 2 weeks)</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="1-3-months">1-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="interest" value={formData.interest} />
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
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-none outline-none"
                  placeholder="What are you looking to build? Any specific requirements or questions?"
                  data-testid="textarea-message"
                ></textarea>
              </div>

              {submitError && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                  {submitError}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-zinc-400" data-testid="text-form-response-time">
                  Response time: within 24 hours
                </p>
                <button 
                  type="submit" 
                  className="btn-primary disabled:opacity-60"
                  data-testid="button-submit-form"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Send Request
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              <div className="pt-2 text-right">
                <a href={buildMailtoUrl()} className="text-sm text-zinc-400 hover:text-brand-300">
                  If this doesn’t send, click here to email us
                </a>
              </div>
            </form>
            ) : (
              <div ref={successRef} tabIndex={-1} className="flex flex-col items-center text-center gap-3 py-8 outline-none" aria-live="polite" role="status">
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Thanks — your request was sent</h3>
                <p className="text-zinc-300 max-w-xl">
                  We’ll reply within 24 hours{lastEmail ? ` at ${lastEmail}` : ""}. If it’s urgent, email
                  {" "}<a href="mailto:brysen@lendgismo.com" className="text-brand-400 hover:text-brand-300">brysen@lendgismo.com</a>.
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <a href="/overview" className="btn-primary">View Technical Overview</a>
                  <a href="/docs" className="btn-ghost">Read the Docs</a>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400" data-testid="text-email-contact">
              Prefer email? Reach us directly at{' '}
              <a href="mailto:brysen@lendgismo.com" className="text-brand-400 hover:text-brand-300 transition" data-testid="link-email-2">
                brysen@lendgismo.com
              </a>
            </p>
          </div>
        </div>
      </section>



      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <Footer />
    </div>
  );
}

