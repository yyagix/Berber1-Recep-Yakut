import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import DeleteBarberButton from "@/components/admin/DeleteBarberButton";

export default async function BarbersPage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const role = session?.role;
  const barberId = session?.barberId;

  const barbers = await prisma.barber.findMany({
    where: role === "BARBER" && barberId ? { id: barberId } : undefined,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading">Berberler</h1>
          <p className="text-[#aaaaaa]">{role === "SUPERADMIN" ? "Mevcut uzman kadronuzu buradan yönetebilirsiniz." : "Kendi profilinizi buradan yönetebilirsiniz."}</p>
        </div>
        {role === "SUPERADMIN" && (
          <Link href="/admin/barbers/new" className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            + Yeni Berber Ekle
          </Link>
        )}
      </header>

      {barbers.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 p-12 rounded-2xl text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-[#666666] mb-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          <h3 className="text-xl font-bold text-white mb-2">Henüz Berber Eklenmedi</h3>
          <p className="text-[#aaaaaa] mb-6">Sistemde kayıtlı bir berber bulunmuyor. Hemen ilk berberinizi ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div key={barber.id} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:border-white/10 transition-colors">
              <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                {barber.image ? (
                  <Image src={barber.image} alt={barber.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#666666]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-1 font-heading">{barber.name}</h3>
                <p className="text-[#888888] text-sm mb-4">/{barber.slug}</p>
                <div className="mt-auto flex gap-3">
                  <Link href={`/admin/barbers/${barber.id}`} className="flex-1 py-2 text-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-semibold">
                    Düzenle
                  </Link>
                  <Link href={`/${barber.slug}`} target="_blank" className="py-2 px-4 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-lg transition-colors flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                  </Link>
                  {role === "SUPERADMIN" && (
                    <DeleteBarberButton id={barber.id} name={barber.name} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
