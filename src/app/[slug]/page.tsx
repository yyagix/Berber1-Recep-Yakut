import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import GalleryGrid from "@/components/GalleryGrid";

import { prisma } from "@/lib/prisma";

export default async function BarberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const barber = await prisma.barber.findUnique({
    where: { slug },
    include: { services: true }
  });

  if (!barber) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24">
      {/* Header */}
      <header className="border-b border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">Berber Profili</h1>
          <div className="flex items-center gap-6">
            <Link href="/randevularim" className="text-sm font-bold text-[#d4af37] hover:text-white transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Randevularım
            </Link>
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              &larr; Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Profile Info */}
        <section>
          <div className="flex flex-col sm:flex-row md:flex-col items-center sm:items-start gap-6 sm:gap-8 mb-12">
            {barber.image && (
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-full md:h-auto md:aspect-[4/5] rounded-full md:rounded-2xl overflow-hidden bg-[#111111] border border-white/5 shadow-2xl shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={barber.image} 
                  alt={barber.name} 
                  className="w-full h-full object-cover transition-all duration-700 md:hover:scale-105"
                />
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-white">{barber.name}</h1>
              <p className="text-[#aaaaaa] text-base md:text-lg leading-relaxed font-light">
                {barber.description}
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6 font-heading text-white">Fiyat Listesi</h2>
          <ul className="space-y-4 mb-12">
            {barber.services.map((service: any) => (
              <li key={service.id} className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-lg font-medium text-white">{service.name}</span>
                <span className="text-[#d4af37] font-bold text-xl">{service.price} ₺</span>
              </li>
            ))}
          </ul>

          <h2 className="text-3xl font-bold mb-6 font-heading text-white">Çalışmaları</h2>
          {barber.gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
              {barber.gallery.slice(0, 3).map((img: string, idx: number) => {
                const isLast = idx === 2;
                const remaining = barber.gallery.length - 2; // We show 2 normal, 3rd is the link to the rest if >3.
                // Wait, if length is 4, we slice 3. We show idx 0, 1, 2. 
                // idx 2 will have +2 overlay (since total is 4, and we show 2 normal ones. So 4 - 2 = 2 remaining to see).
                const showOverlay = isLast && barber.gallery.length > 3;

                const ImageContent = (
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-[#111] shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${barber.name} Çalışması ${idx+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {showOverlay && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition-colors">
                        <span className="text-white text-2xl sm:text-3xl font-bold">+{remaining}</span>
                      </div>
                    )}
                  </div>
                );

                if (showOverlay || isLast) { // Always link the 3rd one if we want, or just link if overlay
                  return <Link href={`/galeri?barber=${barber.slug}`} key={idx} className="block">{ImageContent}</Link>;
                }
                
                // Let's link all of them to /galeri just to be clickable
                return (
                  <Link href={`/galeri?barber=${barber.slug}`} key={idx} className="block">
                    {ImageContent}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-[#888] mb-8 text-sm">Henüz çalışma fotoğrafı yüklenmemiş.</p>
          )}
        </section>

        {/* Booking Form Component */}
        <section>
          <BookingForm 
            barberId={barber.id}
            barberServices={barber.services} 
            workingHours={barber.workingHours}
            dateOverrides={barber.dateOverrides}
          />
        </section>
      </div>
    </main>
  );
}
