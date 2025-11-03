import { useEffect, useState } from 'react';

type Item = { src: string; title?: string; caption?: string };

export default function Showcase() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch('/assets/showcase/manifest.json')
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((m) => setItems(m.items || []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Product Screenshots</h2>
          <p className="text-lg text-zinc-300">A quick look at key flows from AssetLender, styled to match the site.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <figure key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
              <div className="aspect-[16/10] bg-black/30">
                <img src={it.src} alt={it.title || `Screenshot ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {(it.title || it.caption) && (
                <figcaption className="p-4 border-t border-white/10">
                  {it.title && <div className="text-white font-semibold">{it.title}</div>}
                  {it.caption && <div className="text-sm text-zinc-400 mt-1">{it.caption}</div>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
