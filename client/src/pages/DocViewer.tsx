import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { DocsLayout } from "./DocsLayout";

// Lightweight Markdown renderer with compact code blocks and top-right controls.
function renderMarkdown(md: string) {
  const escapeHtml = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
  const slugify = (s: string) => s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  // 1) Extract fenced code blocks first from raw md, build HTML with raw copy and escaped display
  const blocks: string[] = [];
  let working = md.replace(/```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g, (_m, lang, raw) => {
    const language = (lang || '').toString();
    const codeRaw = (raw as string).replace(/^\n+|\n+$/g, '');
    const codeEsc = escapeHtml(codeRaw);
    const controls = `<div class="absolute top-1.5 right-1.5 flex items-center gap-2">`
      + (language ? `<span class="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300 bg-white/5">${language}</span>` : '')
      + `<button class="copy-btn text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-300" data-copy="${encodeURIComponent(codeRaw)}">Copy</button>`
      + `</div>`;
        const htmlBlock = `<pre class="relative bg-zinc-900/95 border border-white/10 rounded-lg pt-7 pb-3 px-3 my-3 overflow-x-auto text-[12px] leading-6" data-language="${language}">`
      + `${controls}<code class="font-mono">${codeEsc}</code></pre>`;
    const idx = blocks.push(htmlBlock) - 1;
    return `__CODE_BLOCK_${idx}__`;
  });

  // 2) Escape the rest
  working = escapeHtml(working);

  // 3) Headings (compact) with anchor IDs
  working = working
    .replace(/^###\s+(.*)$/gm, (_m, t) => {
      const id = slugify(t);
      return `<h3 id="${id}" class="text-white font-semibold mt-5 mb-2 text-base">${t}</h3>`;
    })
    .replace(/^##\s+(.*)$/gm, (_m, t) => {
      const id = slugify(t);
      return `<h2 id="${id}" class="text-white font-bold mt-6 mb-3 text-lg">${t}</h2>`;
    })
    .replace(/^#\s+(.*)$/gm, (_m, t) => {
      const id = slugify(t);
      return `<h1 id="${id}" class="text-white font-extrabold mt-4 mb-3 text-xl">${t}</h1>`;
    });

  // 3.5) Basic unordered lists (- or *) collapsed into <ul><li>
  {
    const lines = working.split(/\r?\n/);
    const out: string[] = [];
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = /^(?:-|\*)\s+(.*)$/.exec(line);
      if (m) {
        if (!inList) {
          out.push('<ul class="my-3 list-disc pl-6">');
          inList = true;
        }
        out.push(`<li>${m[1]}</li>`);
      } else {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');
    working = out.join('\n');
  }

  // 4) Bold/italic and inline code
  working = working
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[12px] font-mono">$1</code>');

  // 5) Links
  working = working.replace(/\[(.*?)\]\((.*?)\)/g, (_m, text, url) => {
    const external = /^(?:https?:)?\/\//.test(url);
    return `<a href="${url}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-brand-400 hover:underline">${text}</a>`;
  });

  // 6) Horizontal rule and paragraphs
  working = working
    .replace(/^---$/gm, '<hr class="my-4 border-white/10"/>')
    .replace(/^(?!<h\d|__CODE_BLOCK_|<hr|<ul|<ol|<li|<pre|<\/ul|<\/ol|<\/li|<\/pre|\s*$)(.+)$/gm, '<p class="text-zinc-300 leading-6 my-2">$1</p>');

  // 7) Inject code blocks back
  working = working.replace(/__CODE_BLOCK_(\d+)__/g, (_m, i) => blocks[Number(i)] || '');

  return working;
}

export default function DocViewer() {
  const [, params] = useRoute("/docs/:slug+");
  const slug = (params?.["slug+"] as string) || "";
  const [content, setContent] = useState<string>("Loading...");
  const pendingHashRef = useRef<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const url = `/docs/${slug}.md`;
    fetch(url)
      .then((r) => (r.ok ? r.text() : `# 404\n\nDocument not found: ${slug}`))
      .then(setContent)
      .catch(() => setContent(`# Error\n\nUnable to load document: ${slug}`));
  }, [slug]);

  const html = useMemo(() => renderMarkdown(content), [content]);

  // Smooth scroll to hash with sticky header offset
  useEffect(() => {
    const scrollToId = (id: string) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      const headerOffset = 80;
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const hash = (pendingHashRef.current || window.location.hash.replace(/^#/, '')).trim();
    if (hash) {
      // Clear pending to avoid double scrolling
      pendingHashRef.current = null;
      // Delay a tick to ensure DOM is painted
      requestAnimationFrame(() => scrollToId(hash));
    }
  }, [html]);

  // Handle in-sidebar hash-only navigation when slug does not change
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.replace(/^#/, '').trim();
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      const headerOffset = 80;
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <DocsLayout>
      <article
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target && target.classList.contains('copy-btn')) {
            const encoded = target.getAttribute('data-copy') || '';
            const text = decodeURIComponent(encoded);
            navigator.clipboard?.writeText(text);
            target.textContent = 'Copied';
            setTimeout(() => { target.textContent = 'Copy'; }, 1200);
          }
          // Anchor navigation handling
          const anchor = (target as HTMLElement).closest('a') as HTMLAnchorElement | null;
          if (anchor) {
            const href = anchor.getAttribute('href') || '';
            if (href.startsWith('#')) {
              e.preventDefault();
              const id = href.replace(/^#/, '');
              // Update hash for shareability
              history.replaceState(null, '', `#${id}`);
              const headerOffset = 80;
              const el = document.getElementById(id);
              if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
              return;
            }
            // Handle internal doc links like /docs/slug#section
            const url = new URL(href, window.location.origin);
            if (url.pathname.startsWith('/docs/')) {
              e.preventDefault();
              const newSlug = url.pathname.replace(/^\/docs\//, '').replace(/^\/+/, '');
              const hash = (url.hash || '').replace(/^#/, '');
              pendingHashRef.current = hash || null;
              navigate(`/docs/${newSlug}`);
              // Also reflect hash in address bar for shareability
              if (hash) {
                // Defer until after navigation paints
                setTimeout(() => history.replaceState(null, '', `#${hash}`), 0);
              }
            }
          }
        }}
      />
    </DocsLayout>
  );
}
