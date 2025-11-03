import { Link } from "wouter";
import { DocsLayout } from "./DocsLayout";
import { BookOpen, FileText, GitMerge, Shield, Settings, Rocket } from "lucide-react";

const Card = ({ title, description, href, icon: Icon }: { title: string; description: string; href: string; icon: any }) => (
  <Link href={href} className="group block rounded-2xl border border-white/10 bg-zinc-900/40 p-6 hover:border-brand-500/50 hover:bg-zinc-900/60 transition-colors">
    <div className="flex items-center gap-3 mb-3">
      <div className="rounded-lg bg-brand-500/10 p-2 text-brand-400 group-hover:text-brand-300">
        <Icon size={20} />
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
    </div>
    <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
  </Link>
);

export default function DocsHome() {
  return (
    <DocsLayout>
  <section className="px-2 md:px-0 py-2">
        <header className="mb-10">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
            <span className="size-1.5 rounded-full bg-brand-500"></span>
            Lendgismo Docs
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Everything you need, in one place
          </h1>
          <p className="mt-3 text-zinc-400 max-w-2xl">
            A concise, skimmable hub for engineers. Start here, then dive into the details.
          </p>
        </header>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card
            title="Architecture"
            description="System overview, components, flows, and future state."
            href="/docs/10_architecture"
            icon={GitMerge}
          />
          <Card
            title="Features"
            description="What exists today, what's planned, and how it fits together."
            href="/docs/40_features-overview"
            icon={Rocket}
          />
          <Card
            title="API Quickstart"
            description="Authenticate and call key endpoints in minutes."
            href="/docs/50_api-quickstart"
            icon={BookOpen}
          />
          <Card
            title="Local Dev"
            description="Get running fast, with tips and troubleshooting."
            href="/docs/60_local-dev"
            icon={Settings}
          />
          <Card
            title="Configuration"
            description="Environment variables and best practices."
            href="/docs/30_configuration"
            icon={FileText}
          />
          <Card
            title="Security"
            description="Defenses, session management, and auth model."
            href="/docs/10_architecture#security-architecture"
            icon={Shield}
          />
        </div>

  <div className="mt-12 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-white font-semibold mb-2">Quick links</h2>
          <ul className="text-sm text-zinc-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 list-disc pl-5">
            <li><Link href="/docs/README" className="hover:text-white">Docs Landing (README)</Link></li>
            <li><Link href="/docs/_STYLE_GUIDE" className="hover:text-white">Docs Style Guide</Link></li>
            <li><Link href="/docs/_DOC_TEMPLATE" className="hover:text-white">Doc Template</Link></li>
            <li><Link href="/docs/11_architecture-diagrams" className="hover:text-white">Diagrams</Link></li>
            <li><Link href="/docs/20_data-model" className="hover:text-white">Data Model</Link></li>
            <li><Link href="/docs/31_secrets-and-keys" className="hover:text-white">Secrets & Keys</Link></li>
          </ul>
        </div>
      </section>
    </DocsLayout>
  );
}
