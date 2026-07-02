import { prisma } from "@/lib/prisma";
import AppointmentStatus from "@/components/admin/AppointmentStatus";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import TabScroller from "@/components/TabScroller";

import Link from "next/link";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ barber?: string }> }) {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const role = session?.role;
  const sessionBarberId = session?.barberId;
  const params = await searchParams;
  const filterBarberId = params.barber;

  // If SUPERADMIN, fetch barbers for the filter tabs
  const barbers = role === "SUPERADMIN" ? await prisma.barber.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "asc" } }) : [];

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: role === "BARBER" && sessionBarberId 
        ? sessionBarberId 
        : (filterBarberId && filterBarberId !== "all" ? filterBarberId : undefined)
    },
    include: {
      barber: true,
      service: true
    },
    orderBy: {
      dateTime: "desc"
    }
  });

  return (
    <div>
      <TabScroller activeId="active-appointment-tab" />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading">Randevular</h1>
          <p className="text-[#aaaaaa]">{role === "SUPERADMIN" ? "Gelen tüm randevu taleplerini buradan yönetebilirsiniz." : "Kendi randevularınızı buradan yönetebilirsiniz."}</p>
        </div>
      </header>

      {/* Barber Filter Tabs (Only for Superadmin) */}
      {role === "SUPERADMIN" && barbers.length > 0 && (
        <div className="relative mb-6">
          <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10"></div>
          <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-none px-4 md:px-0 pr-12">
            <Link 
              href="/admin/appointments"
              id={(!filterBarberId || filterBarberId === 'all') ? "active-appointment-tab" : undefined}
              className={`flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border shadow-md
                ${!filterBarberId || filterBarberId === 'all' 
                  ? 'bg-[#d4af37] border-[#d4af37] text-black' 
                  : 'bg-[#111111] border-white/10 text-white hover:border-[#d4af37]/50'
                }
              `}
            >
              Tümü
            </Link>
            {barbers.map(b => {
              const isActive = filterBarberId === b.id;
              return (
                <Link 
                  key={b.id}
                  href={`/admin/appointments?barber=${b.id}`}
                  id={isActive ? "active-appointment-tab" : undefined}
                  className={`flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border shadow-md
                    ${isActive 
                      ? 'bg-[#d4af37] border-[#d4af37] text-black' 
                      : 'bg-[#111111] border-white/10 text-white hover:border-[#d4af37]/50'
                    }
                  `}
                >
                  {b.name}
                </Link>
              );
            })}
          </div>
          {/* Scroll Fade Effect Right */}
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10"></div>
        </div>
      )}

      {/* Mobile Card View (hidden on md and up) */}
      <div className="md:hidden flex flex-col gap-4">
        {appointments.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center text-[#666666]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-50"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Bu filtrelere uygun randevu bulunmuyor.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{appt.customerName}</h3>
                  <p className="text-sm text-[#aaaaaa] mt-0.5">{appt.customerPhone}</p>
                </div>
                <div className="text-right">
                  <div className="text-[#d4af37] font-bold text-lg leading-tight">
                    {new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(appt.dateTime))}
                  </div>
                  <div className="text-white text-xs mt-0.5">
                    {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(appt.dateTime))}
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-white/5 w-full"></div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-medium">{appt.service.name}</div>
                  <div className="text-xs text-[#aaaaaa] mt-0.5">{appt.service.price} ₺ • Berber: <span className="text-white">{appt.barber.name}</span></div>
                </div>
              </div>
              
              <div className="mt-2">
                <AppointmentStatus id={appt.id} currentStatus={appt.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#1a1a1a] text-[#888888] text-[10px] md:text-sm uppercase tracking-wider border-b border-white/5">
                <th className="p-4 md:p-5 font-semibold w-1/4">Müşteri</th>
                <th className="p-4 md:p-5 font-semibold w-1/4">Zaman</th>
                <th className="p-4 md:p-5 font-semibold w-1/5">Berber</th>
                <th className="p-4 md:p-5 font-semibold w-1/5">Hizmet</th>
                <th className="p-4 md:p-5 font-semibold w-auto">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#666666]">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-50"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Bu filtrelere uygun randevu bulunmuyor.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors text-base">
                    <td className="p-4 md:p-5 truncate">
                      <div className="font-bold text-white truncate">{appt.customerName}</div>
                      <div className="text-sm text-[#aaaaaa] truncate">{appt.customerPhone}</div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="text-white text-base">
                        {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(appt.dateTime))}
                      </div>
                      <div className="text-[#d4af37] font-bold text-sm">
                        {new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(appt.dateTime))}
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="font-medium text-white truncate">{appt.barber.name}</div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="text-white truncate text-base">{appt.service.name}</div>
                      <div className="text-sm text-[#aaaaaa]">{appt.service.price} ₺</div>
                    </td>
                    <td className="p-4 md:p-5">
                      <AppointmentStatus id={appt.id} currentStatus={appt.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
