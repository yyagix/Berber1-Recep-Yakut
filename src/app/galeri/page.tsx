import Image from "next/image";
import Link from "next/link";
import GalleryGrid from "@/components/GalleryGrid";
import TabScroller from "@/components/TabScroller";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ barber?: string }> }) {
  const params = await searchParams;
  const selectedBarberSlug = params.barber;

  // Fetch all barbers and their galleries
  const barbers = await prisma.barber.findMany({
    select: { name: true, slug: true, gallery: true },
    orderBy: { createdAt: "asc" }
  });

  // Determine which images to show
  let displayImages: string[] = [];
  if (selectedBarberSlug && selectedBarberSlug !== "all") {
    const selectedBarber = barbers.find(b => b.slug === selectedBarberSlug);
    if (selectedBarber) {
      displayImages = selectedBarber.gallery || [];
    }
  } else {
    displayImages = barbers.flatMap(b => b.gallery).filter(Boolean);
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <TabScroller activeId="active-gallery-tab" />
      <header className="border-b border-border py-6 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading text-white">Galeri</h1>
            <p className="text-muted-foreground mt-2">Recep Yakut Hair Academy'den öne çıkan tasarımlar.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 shrink-0">
            &larr; Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Filtering Tabs */}
        <div className="relative mb-8">
          <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
          <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-none px-4 md:px-0 pr-12">
            <Link 
              href="/galeri"
              id={(!selectedBarberSlug || selectedBarberSlug === 'all') ? "active-gallery-tab" : undefined}
              className={`flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border shadow-md
                ${!selectedBarberSlug || selectedBarberSlug === 'all' 
                  ? 'bg-[#d4af37] border-[#d4af37] text-black' 
                  : 'bg-[#111111] border-white/10 text-white hover:border-[#d4af37]/50'
                }
              `}
            >
              Tümü
            </Link>
            {barbers.map(barber => {
              const isActive = selectedBarberSlug === barber.slug;
              return (
                <Link 
                  key={barber.slug}
                  href={`/galeri?barber=${barber.slug}`}
                  id={isActive ? "active-gallery-tab" : undefined}
                  className={`flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border shadow-md
                    ${isActive 
                      ? 'bg-[#d4af37] border-[#d4af37] text-black' 
                      : 'bg-[#111111] border-white/10 text-white hover:border-[#d4af37]/50'
                    }
                  `}
                >
                  {barber.name}
                </Link>
              );
            })}
          </div>
          {/* Scroll Fade Effect Right */}
          <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
        </div>

        {displayImages.length > 0 ? (
          <GalleryGrid 
            images={displayImages}
            gridClass="grid grid-cols-3 gap-1 sm:gap-4"
            cardClass="relative aspect-square overflow-hidden border border-white/5 group"
            imageClass="object-cover transition-transform duration-700 group-hover:scale-110"
            useFill={true}
          />
        ) : (
          <div className="text-center py-20 text-[#888888] bg-[#111] rounded-2xl border border-white/5">
            <p>Bu filtrelere uygun fotoğraf bulunamadı.</p>
          </div>
        )}
      </div>
    </main>
  );
}
