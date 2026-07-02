"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

export default function AdminSidebar({ role, barberId }: { role: string, barberId?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Define menu items based on role
  const menuItems = [
    { name: "Panel", href: "/admin", icon: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></> }
  ];

  if (role === "SUPERADMIN") {
    menuItems.push(
      { name: "Berberler", href: "/admin/barbers", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
      { name: "Randevular", href: "/admin/appointments", icon: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></> }
    );
  } else if (role === "BARBER" && barberId) {
    menuItems.push(
      { name: "Sayfam", href: `/admin/barbers/${barberId}`, icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
      { name: "Randevular", href: "/admin/appointments", icon: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></> }
    );
  }

  menuItems.push(
    { name: "Sisteme Dön", href: "/", icon: <><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></> }
  );

  const handleLogout = async () => {
    await logoutAction();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-white/5 fixed h-full z-20">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white font-heading tracking-tight">RECEP YAKUT</h2>
          <p className="text-[#d4af37] text-sm italic">Yönetim Paneli</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-[#d4af37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "text-[#aaaaaa] hover:bg-white/5 hover:text-white"}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile Topbar & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-white/5 z-30 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-white font-heading">RY <span className="text-[#d4af37]">Panel</span></h2>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-[#0a0a0a] pt-16 flex flex-col">
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-colors ${isActive ? "bg-[#d4af37] text-black font-bold" : "text-[#aaaaaa] bg-[#111111]"}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-6">
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 p-4 w-full text-center font-bold text-red-400 bg-red-500/10 rounded-xl"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </>
  );
}
