import React, { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { CheckCircle, Search, ExternalLink, Link as LinkIcon, FileSpreadsheet } from "lucide-react";

type LpEntry = {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  type: "core" | "state" | string;
};

type Manifest = {
  generatedAt: string;
  baseUrl: string;
  count: number;
  pages: LpEntry[];
};

export default function Marketing() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "core" | "state">("all");

  useEffect(() => {
    fetch("/lp/manifest.json", { cache: "no-cache" })
      .then((r) => r.json())
      .then((data: Manifest) => setManifest(data))
      .catch(() => setManifest(null));
  }, []);

  const pages = useMemo(() => {
    const list = manifest?.pages || [];
    const needle = q.trim().toLowerCase();
    return list.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (!needle) return true;
      return (
        p.slug.toLowerCase().includes(needle) ||
        p.title.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle)
      );
    });
  }, [manifest, q, type]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="min-h-screen">
      <Seo 
        title="Marketing LP Manager — Lendgismo"
        description="Internal listing and previews for SEO landing pages generated under /lp."
        url="https://lendgismo.com/marketing"
        image="/assets/showcase/20251023-0938/02_dashboard--desktop.png"
      />
      <Navigation />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Marketing Landing Pages</h1>
              <p className="text-zinc-400 text-sm">Hidden utility page. Lists all static LPs under <code>/lp/*</code>. Use for quick preview and links with UTM params.</p>
            </div>
            <a href="/sitemaps/lp.xml" target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2">
              <FileSpreadsheet size={16} /> LP Sitemap
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 md:p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Find by title, slug, or description"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-9 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                >
                  <option value="all">All</option>
                  <option value="core">Core</option>
                  <option value="state">State</option>
                </select>
              </div>
              <div className="text-sm text-zinc-400">
                <div className="mb-1">Total: <span className="text-white font-semibold">{manifest?.count ?? 0}</span></div>
                <div className="mb-1">Filtered: <span className="text-white font-semibold">{pages.length}</span></div>
                <div>Generated: {manifest?.generatedAt ? new Date(manifest.generatedAt).toLocaleString() : "--"}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((p) => (
              <div key={p.slug} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur flex flex-col">
                <div className="text-xs uppercase text-zinc-400 mb-1">{p.type === "state" ? "Geo" : "Core"}</div>
                <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                <p className="text-zinc-400 text-sm mb-3 line-clamp-3">{p.description}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <a href={p.canonical} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-1">
                    <ExternalLink size={16} /> Preview
                  </a>
                  <button onClick={() => copy(p.canonical)} className="btn-ghost inline-flex items-center gap-1">
                    <LinkIcon size={16} /> Copy URL
                  </button>
                  <a href={`/lp/${p.slug}/`} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1">
                    <CheckCircle size={16} /> Static
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
