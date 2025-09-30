interface GalleryItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface GalleryProps {
  items: GalleryItem[];
}

export default function Gallery({ items }: GalleryProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="card group hover:bg-white/10 transition-all"
          data-testid={`card-gallery-${index}`}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-brand-950 to-brand-900 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-white font-semibold text-lg" data-testid={`text-gallery-title-${index}`}>
                  {item.title}
                </div>
                <div className="text-zinc-400 text-sm mt-2" data-testid={`text-gallery-subtitle-${index}`}>
                  {item.description}
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2" data-testid={`text-gallery-heading-${index}`}>
            {item.title}
          </h3>
          <p className="text-sm text-zinc-300" data-testid={`text-gallery-description-${index}`}>
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
