import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export default async function AdminDashboard() {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const role = session?.role;
  const sessionBarberId = session?.barberId;

  const [totalBarbers, totalAppointments, pendingAppointments] = await Promise.all([
    prisma.barber.count({ where: role === "BARBER" && sessionBarberId ? { id: sessionBarberId } : undefined }),
    prisma.appointment.count({ where: role === "BARBER" && sessionBarberId ? { barberId: sessionBarberId } : undefined }),
    prisma.appointment.count({ where: { status: "PENDING", ...(role === "BARBER" && sessionBarberId ? { barberId: sessionBarberId } : {}) } })
  ]);

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 font-heading">Hoş Geldiniz</h1>
        <p className="text-[#aaaaaa]">Recep Yakut Hair Academy yönetim paneline hoş geldiniz. Buradan tüm işlemlerinizi yönetebilirsiniz.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Barbers - Only for SUPERADMIN */}
        {role === "SUPERADMIN" && (
          <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-lg">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#d4af37] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 font-heading">{totalBarbers}</h3>
            <p className="text-[#888888] text-sm font-medium">Toplam Berber</p>
          </div>
        )}

        {/* Total Appointments */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
          <h3 className="text-4xl font-bold text-white mb-1 font-heading">{totalAppointments}</h3>
          <p className="text-[#888888] text-sm font-medium">Toplam Randevu</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 className="text-4xl font-bold text-white mb-1 font-heading">{pendingAppointments}</h3>
          <p className="text-[#888888] text-sm font-medium">Bekleyen Onaylar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Hızlı İşlemler</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {role === "SUPERADMIN" && (
              <Link href="/admin/barbers/new" className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] hover:bg-[#d4af37]/10 border border-white/5 hover:border-[#d4af37]/30 rounded-xl transition-all group">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888888] group-hover:text-[#d4af37] mb-3 transition-colors"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                <span className="text-sm font-medium text-white text-center">Yeni Berber Ekle</span>
              </Link>
            )}
            {role === "BARBER" && sessionBarberId && (
              <Link href={`/admin/barbers/${sessionBarberId}`} className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] hover:bg-[#d4af37]/10 border border-white/5 hover:border-[#d4af37]/30 rounded-xl transition-all group">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888888] group-hover:text-[#d4af37] mb-3 transition-colors"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-sm font-medium text-white text-center">Sayfam</span>
              </Link>
            )}
            <Link href="/admin/appointments" className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all group">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888888] group-hover:text-white mb-3 transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="text-sm font-medium text-white text-center">Randevuları Gör</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
