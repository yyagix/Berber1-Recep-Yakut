import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DescriptionManager from "@/components/admin/DescriptionManager";
import AvailabilityManager from "@/components/admin/AvailabilityManager";
import ServicesManager from "@/components/admin/ServicesManager";
import GalleryManager from "@/components/admin/GalleryManager";
import DeleteBarberButton from "@/components/admin/DeleteBarberButton";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export default async function BarberAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const role = session?.role;
  
  const barber = await prisma.barber.findUnique({
    where: { id },
    include: { services: true }
  });

  if (!barber) {
    notFound();
  }

  return (
    <div>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/barbers" className="p-2 text-[#aaaaaa] hover:text-white bg-[#111111] rounded-lg transition-colors border border-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/10 shrink-0">
              {barber.image ? (
                <Image src={barber.image} alt={barber.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#666666]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-heading">{barber.name}</h1>
              <p className="text-[#aaaaaa] text-sm">Profil Düzenleme & Hizmet Yönetimi</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "SUPERADMIN" && (
            <DeleteBarberButton id={barber.id} name={barber.name} />
          )}
          
          <Link 
            href={`/${barber.slug}`} 
            target="_blank"
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors border border-white/10 text-sm font-semibold"
          >
            Sitede Görüntüle
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <DescriptionManager 
          barberId={barber.id} 
          initialName={barber.name}
          initialSlug={barber.slug}
          initialDescription={barber.description} 
        />

        <AvailabilityManager 
          barberId={barber.id} 
          initialWorkingHours={barber.workingHours} 
          initialDateOverrides={barber.dateOverrides}
          initialSlotInterval={barber.slotInterval}
        />

        <ServicesManager barberId={barber.id} initialServices={barber.services} />
        
        <GalleryManager barberId={barber.id} initialGallery={barber.gallery} />
      </div>
    </div>
  );
}
