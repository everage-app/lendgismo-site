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
            {/* Browser Chrome */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-sm border-b border-white/10 flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
              </div>
              <div className="flex-1 h-5 bg-white/5 rounded mx-2"></div>
            </div>
            
            {/* Screenshot Mockup Content */}
            <div className="absolute inset-0 pt-8 p-6">
              <div className="h-full flex flex-col">
                {/* Header/Title Area */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/30 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-white/20 rounded mb-1"></div>
                      <div className="h-2 w-16 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-7 bg-brand-500/30 rounded border border-brand-500/40"></div>
                    <div className="w-8 h-7 bg-white/10 rounded"></div>
                  </div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 grid gap-3">
                  {/* Chart/Data Visualization */}
                  {index === 0 || index === 1 ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-white/5 rounded-lg border border-white/10 flex items-end p-2">
                        <div className="w-full h-8 bg-brand-500/30 rounded"></div>
                      </div>
                      <div className="h-16 bg-white/5 rounded-lg border border-white/10 flex items-end p-2">
                        <div className="w-full h-12 bg-brand-500/40 rounded"></div>
                      </div>
                      <div className="h-16 bg-white/5 rounded-lg border border-white/10 flex items-end p-2">
                        <div className="w-full h-6 bg-brand-500/30 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-10 bg-white/5 rounded border border-white/10 flex items-center px-3 gap-2">
                        <div className="w-4 h-4 bg-brand-500/30 rounded"></div>
                        <div className="flex-1 h-3 bg-white/10 rounded"></div>
                        <div className="w-16 h-3 bg-white/10 rounded"></div>
                      </div>
                      <div className="h-10 bg-white/5 rounded border border-white/10 flex items-center px-3 gap-2">
                        <div className="w-4 h-4 bg-brand-500/30 rounded"></div>
                        <div className="flex-1 h-3 bg-white/10 rounded"></div>
                        <div className="w-16 h-3 bg-white/10 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent pointer-events-none"></div>
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
