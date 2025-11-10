import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import SiteLogo from "@/components/SiteLogo";
// Fuse will be loaded dynamically inside an effect

type DocEntry = { slug: string; file: string; title: string; updatedAt: string; hidden?: boolean };

function useManifest() {
  const [manifest, setManifest] = useState<DocEntry[]>([]);
  useEffect(() => {
    fetch("/docs/manifest.json")
      .then((r) => (r.ok ? r.json() : []))
      .then(setManifest)
      .catch(() => setManifest([]));
  }, []);
  return manifest;
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const rawManifest = useManifest();
  const manifest = useMemo(() =>
    rawManifest.filter((d) => {
      const base = d.file.split("/").pop()?.toLowerCase();
      if (d.hidden) return false;
      if (base === "_doc_template.md") return false;
      return true;
    }),
  [rawManifest]);

  // Build a lightweight search index in-memory (title + content)
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<{ slug: string; title: string; content: string }[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [location, navigate] = useLocation();
  const [results, setResults] = useState<{ slug: string; title: string; snippet: string }[]>([]);
  const fuseRef = useRef<any | null>(null);
  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  // Highlight helper: wrap matched query terms with <mark>
  const renderSnippet = (snippet: string) => {
    const q = query.trim();
    if (!q) return snippet;
    try {
      const idx = snippet.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return snippet;
      const before = snippet.slice(0, idx);
      const hit = snippet.slice(idx, idx + q.length);
      const after = snippet.slice(idx + q.length);
      return (
        <>
          {before}
          <mark className="bg-amber-500/30 text-amber-200 rounded px-0.5">{hit}</mark>
          {after}
        </>
      );
    } catch {
      return snippet;
    }
  };

  // Global hotkeys to focus the search: '/' or Ctrl/Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as any).isContentEditable);
      if (isTyping) return;
      if (e.key === '/' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if ((e.key.toLowerCase() === 'k') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close search when clicking outside the search container
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Close search and clear results on route change
  useEffect(() => {
    if (open) setOpen(false);
    if (query) setQuery("");
    setActiveIdx(0);
    setResults([]);
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (loadingIndex || index.length > 0) return;
      setLoadingIndex(true);
      // 1) Try localStorage cache first for instant availability
      try {
        const cached = localStorage.getItem('docs-search-index-v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            setIndex(parsed);
          }
        }
      } catch {}
      // 2) Prefer prebuilt search index for speed if present
      let items: { slug: string; title: string; content: string }[] = [];
      try {
        const res = await fetch(`/docs/search-index.json`);
        if (res.ok) {
          items = await res.json();
          try { localStorage.setItem('docs-search-index-v1', JSON.stringify(items)); } catch {}
        }
      } catch {}
      // Fallback: fetch docs inline (already implemented previously)
      if (items.length === 0 && manifest.length > 0) {
        for (const d of manifest) {
          try {
            const res = await fetch(`/docs/${d.file}`);
            if (!res.ok) continue;
            const text = await res.text();
            items.push({ slug: d.slug, title: d.title, content: text });
          } catch {}
        }
      }
      if (!cancelled) {
        if (items.length) setIndex(items);
        setLoadingIndex(false);
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [manifest, loadingIndex, index.length]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setActiveIdx(0);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      // Progressive narrowing: small queries prioritize title prefixes, then fuzzy with dynamic limits
      const len = q.length;
      const topK = len <= 2 ? 5 : len <= 4 ? 8 : 12;
      const titleNeedle = q.toLowerCase();
      // 1) For very short queries, prefer fast title prefix matches
      if (len <= 2) {
        const pref = index.filter((it) => it.title.toLowerCase().startsWith(titleNeedle)).slice(0, topK);
        const out = pref.map((it) => {
          const pos = it.content.toLowerCase().indexOf(titleNeedle);
          const start = pos > 40 ? pos - 40 : 0;
          const snippet = pos >= 0 ? it.content.slice(start, start + 160).replace(/\n/g, ' ') : '';
          return { slug: it.slug, title: it.title, snippet };
        });
        if (!cancelled) {
          setResults(out);
          setActiveIdx(0);
        }
        return;
      }

      // 2) Fuzzy ranking with tighter thresholds as query length increases
      try {
        const Fuse = (await import('fuse.js')).default as any;
        const threshold = Math.max(0.05, 0.5 - len * 0.06); // e.g. len3~0.32, len5~0.2, len8+~0.05
        const fuse = new Fuse(index, {
          includeMatches: true,
          threshold,
          ignoreLocation: true,
          minMatchCharLength: Math.min(3, len),
          keys: [
            { name: 'title', weight: 0.8 },
            { name: 'content', weight: 0.2 },
          ],
        });

        // Boost exact/prefix title matches to the top
        const prefixMatches = index.filter((it) => it.title.toLowerCase().startsWith(titleNeedle));
        const fuzzy = fuse.search(q).map((r: any) => r.item) as typeof index;
        const merged: { slug: string; title: string; snippet: string }[] = [];
        const seen = new Set<string>();
        for (const it of [...prefixMatches, ...fuzzy]) {
          if (seen.has(it.slug)) continue;
          seen.add(it.slug);
          const pos = it.content.toLowerCase().indexOf(titleNeedle);
          const start = pos > 40 ? pos - 40 : 0;
          const snippet = pos >= 0 ? it.content.slice(start, start + 160).replace(/\n/g, ' ') : '';
          merged.push({ slug: it.slug, title: it.title, snippet });
          if (merged.length >= topK) break;
        }

        // Fallback: simple contains if somehow empty
        const finalOut = merged.length > 0 ? merged : ((): { slug: string; title: string; snippet: string }[] => {
          const needle = q.toLowerCase();
          return index.map((it) => {
            const pos = it.content.toLowerCase().indexOf(needle);
            if (it.title.toLowerCase().includes(needle) || pos >= 0) {
              const start = pos > 40 ? pos - 40 : 0;
              const snippet = pos >= 0 ? it.content.slice(start, start + 160).replace(/\n/g, ' ') : '';
              return { slug: it.slug, title: it.title, snippet };
            }
            return null;
          }).filter(Boolean).slice(0, topK) as any;
        })();

        if (!cancelled) {
          setResults(finalOut);
          setActiveIdx(0);
        }
        return;
      } catch {}

      // 3) Final fallback: simple contains
      const needle = q.toLowerCase();
      const basic = index.map((it) => {
        const pos = it.content.toLowerCase().indexOf(needle);
        if (it.title.toLowerCase().includes(needle) || pos >= 0) {
          const start = pos > 40 ? pos - 40 : 0;
          const snippet = pos >= 0 ? it.content.slice(start, start + 160).replace(/\n/g, ' ') : '';
          return { slug: it.slug, title: it.title, snippet };
        }
        return null;
      }).filter(Boolean) as { slug: string; title: string; snippet: string }[];
      if (!cancelled) {
        setResults(basic.slice(0, topK));
        setActiveIdx(0);
      }
    }, 80); // small debounce for fast typing
    return () => { cancelled = true; clearTimeout(handle); };
  }, [query, index]);

  // Build sidebar groups in a developer-friendly order
  const groupedNav = useMemo(() => {
    const byFile = (f: string) => f.toLowerCase();
    const used = new Set<string>();
    const take = (predicate: (d: DocEntry) => boolean) => {
      const items = manifest.filter((d) => !used.has(d.slug) && predicate(d));
      items.forEach((d) => used.add(d.slug));
      return items;
    };
    const startsWithAny = (d: DocEntry, prefixes: string[]) => prefixes.some((p) => byFile(d.file).startsWith(p));
    const fileIs = (d: DocEntry, names: string[]) => names.includes(byFile(d.file));

    const gettingStarted = take((d) => fileIs(d, [
      '60_local-dev.md',
      '50_api-quickstart.md',
      '00_repo-inventory.md',
    ]));
    const architecture = take((d) => startsWithAny(d, ['10_', '11_', '12_']));
    const dataModel = take((d) => startsWithAny(d, ['20_', '21_', '22_']));
    const configSecrets = take((d) => startsWithAny(d, ['30_', '31_']));
    const features = take((d) => startsWithAny(d, ['40_']));
    const api = take((d) => startsWithAny(d, ['50_']));
    const operations = take((d) => startsWithAny(d, ['99_']));
    const other = take(() => true);

    const nonEmpty = <T,>(title: string, items: T[]) => items.length ? { title, items } : null;
    // Move Features near the top
    return [
      nonEmpty('Features', features),
      nonEmpty('Getting started', gettingStarted),
      nonEmpty('Architecture', architecture),
      nonEmpty('Data model', dataModel),
      nonEmpty('API', api),
      nonEmpty('Configuration & secrets', configSecrets),
      nonEmpty('Ops & readiness', operations),
      nonEmpty('Other docs', other),
    ].filter(Boolean) as { title: string; items: DocEntry[] }[];
  }, [manifest]);

  // Keyboard '/' to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Removed mode badge (Mock/Live) from docs header to keep presentation official

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Header with logo + search */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0"><SiteLogo size={36} glow /></Link>
          <div className="text-lg md:text-xl font-semibold text-brand-400">Docs</div>
          {/* Mode badge removed */}
          <a
            href="https://platform.lendgismo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 ml-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] text-brand-300 hover:text-white hover:bg-brand-500/20 transition"
            title="Open the live platform in a new tab"
            data-testid="link-docs-platform"
          >
            Try the App
            <ExternalLink size={12} />
          </a>
          <div ref={containerRef} className="ml-auto relative w-full max-w-xl">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (!open || results.length === 0) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
                if (e.key === 'Enter') { e.preventDefault(); const r = results[activeIdx]; if (r) { setOpen(false); setQuery(""); inputRef.current?.blur(); navigate(`/docs/${r.slug}`); } }
                if (e.key === 'Escape') { setOpen(false); }
              }}
              placeholder={loadingIndex ? "Building index…" : "Search docs ( / )"}
              className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500 text-white placeholder:text-zinc-500"
              data-testid="docs-search-input"
            />
            {open && query && (
              <div className="absolute mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 shadow-lg overflow-hidden">
                {results.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-zinc-400">{loadingIndex ? 'Indexing…' : 'No results'}</div>
                ) : results.map((r, i) => (
                  <Link key={r.slug}
                    href={`/docs/${r.slug}`}
                    className={`block px-3 py-2 hover:bg-white/5 ${i === activeIdx ? 'bg-white/5' : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { setOpen(false); setQuery(""); inputRef.current?.blur(); }}>
                    <div className="text-white text-sm">{r.title}</div>
                    {r.snippet && <div className="text-xs text-zinc-400 line-clamp-2">{renderSnippet(r.snippet)}</div>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-6 py-4">
        <aside className="col-span-12 md:col-span-3 border border-white/10 rounded-xl p-4 bg-black/30 sticky top-[64px] h-fit">
          <div className="mb-3 text-xs uppercase tracking-wide text-brand-400 font-semibold">Docs</div>
          <div className="max-h-[calc(100vh-160px)] overflow-y-auto pr-1 scrollbar-blue">
            <nav className="space-y-3">
              <Link href="/docs" className="block rounded px-2 py-1.5 hover:bg-white/5">Overview</Link>
              {groupedNav.map((group) => (
                <div key={group.title}>
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">{group.title}</div>
                  <div className="mt-1 space-y-1">
                    {group.items.map((d) => (
                      <a key={d.slug} href={`/docs/${d.slug}`} className="block rounded px-2 py-1.5 hover:bg-white/5">
                        {d.title}
                      </a>
                    ))}
                  </div>
                  {group.title === 'Features' && manifest.some((d) => d.file.toLowerCase() === '50_api-quickstart.md') && (
                    <div className="ml-2 mt-2">
                      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">Quick links</div>
                      <ul className="mt-1 space-y-1">
                        {[
                          { label: 'Integrations Demo', href: '/docs/demo/integrations' },
                          { label: 'Integrations', href: '/docs/40_integrations' },
                          { label: 'Authentication', hash: 'authentication' },
                          { label: 'Loan Applications', hash: 'loan-applications' },
                          { label: 'Documents', hash: 'documents' },
                          { label: 'Borrowers', hash: 'borrowers-lenders-only' },
                          { label: 'Invites', hash: 'invites-lenders-only' },
                          { label: 'Dashboard', hash: 'dashboard' },
                          { label: 'Errors', hash: 'error-handling' },
                          { label: 'Rate Limiting', hash: 'rate-limiting' },
                          { label: 'Pagination', hash: 'pagination' },
                          { label: 'Postman Collection', hash: 'postman-collection' },
                          { label: 'Full API Reference', hash: 'full-api-reference' },
                        ].map((it) => (
                          <li key={it.hash || it.label}>
                            {it.href ? (
                              <a href={it.href} className="block rounded px-2 py-1.5 hover:bg-white/5 text-sm">{it.label}</a>
                            ) : (
                              <a
                                href={`/docs/50_api-quickstart#${it.hash}`}
                                className="block rounded px-2 py-1.5 hover:bg-white/5 text-sm"
                              >
                                {it.label}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
