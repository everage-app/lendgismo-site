import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Upload, Shield, CheckCircle } from "lucide-react";

export default function Overview() {
  const galleryItems = [
    {
      title: "Borrower Portal",
      description: "Clean, intuitive dashboard for borrowers to track applications, upload documents, and communicate with lenders.",
      icon: <BarChart3 size={32} className="text-brand-400" />
    },
    {
      title: "Admin Dashboard",
      description: "Comprehensive admin interface with analytics, user management, and loan portfolio overview.",
      icon: <BarChart3 size={32} className="text-brand-400" />
    },
    {
      title: "CSV Onboarding",
      description: "Streamlined data import wizard with validation, error handling, and preview before committing.",
      icon: <Upload size={32} className="text-brand-400" />
    },
    {
      title: "RBAC System",
      description: "Granular permission controls with role management, user groups, and access policies.",
      icon: <Shield size={32} className="text-brand-400" />
    }
  ];

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

      {/* Overview Hero */}
      <section className="py-20 md:py-32">
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
              Vixo V3 Platform <br/>
              <span className="text-gradient">Complete Overview</span>
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed" data-testid="text-overview-description">
              A deep dive into the architecture, features, and capabilities of the Vixo V3 platform. 
              Explore our modern tech stack, see real screenshots, and understand how this foundation 
              can accelerate your lending platform development.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-tech-heading">Technology Stack</h2>
            <p className="text-lg text-zinc-300" data-testid="text-tech-description">Built with modern, battle-tested technologies for scalability and developer experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Frontend', items: ['• Next.js 14 (App Router)', '• React 18', '• TypeScript', '• Tailwind CSS'] },
              { title: 'UI Components', items: ['• shadcn/ui patterns', '• Radix UI primitives', '• Lucide icons', '• Class Variance Authority'] },
              { title: 'Forms & Data', items: ['• React Hook Form', '• Zod validation', '• Date-fns utilities', '• CSV parsing'] },
              { title: 'Deployment', items: ['• Netlify ready', '• Vercel compatible', '• Azure deployable', '• Docker support'] },
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

      {/* Screenshot Gallery */}
      <section className="py-20 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-gallery-heading">Platform Screenshots</h2>
            <p className="text-lg text-zinc-300" data-testid="text-gallery-description">Visual walkthrough of key interfaces and workflows</p>
          </div>
          
          <Gallery items={galleryItems} />
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
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

      {/* Implementation Details */}
      <section className="py-20 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
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

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-cta-heading">
            Ready to accelerate your <span className="text-gradient">development timeline?</span>
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-2xl mx-auto" data-testid="text-cta-description">
            Get started with Vixo V3 today and launch your lending platform in weeks instead of months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact" className="btn-primary" data-testid="button-cta-handoff">
              Request Code Handoff
              <ArrowRight size={20} />
            </Link>
            <Link href="/#pricing" className="btn-ghost" data-testid="button-cta-pricing">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
