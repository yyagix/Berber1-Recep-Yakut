"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2 z-50 text-white">
            RECEP YAKUT <span className="text-[#d4af37] italic font-light text-base mt-1">Hair Academy</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
            <Link href="/#hakkimizda" className="hover:text-[#d4af37] transition-colors">Hakkımızda</Link>
            <Link href="/#kadromuz" className="hover:text-[#d4af37] transition-colors">Kadromuz</Link>
            <Link href="/#yorumlar" className="hover:text-[#d4af37] transition-colors">Yorumlar</Link>
            <Link href="/galeri" className="hover:text-[#d4af37] transition-colors">Galeri</Link>
            <Link href="/#iletisim" className="hover:text-[#d4af37] transition-colors">İletişim</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/randevularim" className="text-white hover:text-[#d4af37] transition-colors text-sm font-semibold flex items-center gap-2 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Randevularım
            </Link>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Link href="/#kadromuz" className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold rounded-sm hover:bg-white active:scale-95 transition-all duration-300 text-sm">
              Randevu Al
            </Link>
          </div>

          {/* Burger Menu Button */}
          <button 
            className="md:hidden z-50 text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12"/>
                  <line x1="4" x2="20" y1="6" y2="6"/>
                  <line x1="4" x2="20" y1="18" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-[#0a0a0a] transition-all duration-500 flex flex-col items-center justify-center ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-8 text-2xl font-bold font-heading text-white">
          <Link href="/#hakkimizda" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#d4af37] transition-colors">Hakkımızda</Link>
          <Link href="/#kadromuz" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#d4af37] transition-colors">Kadromuz</Link>
          <Link href="/#yorumlar" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#d4af37] transition-colors">Yorumlar</Link>
          <Link href="/galeri" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#d4af37] transition-colors">Galeri</Link>
          <Link href="/#iletisim" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#d4af37] transition-colors">İletişim</Link>
          <Link href="/randevularim" onClick={() => setIsMobileMenuOpen(false)} className="text-[#d4af37] flex items-center gap-3 active:scale-95 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Randevularım
          </Link>
          <Link href="/#kadromuz" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 px-10 py-4 bg-[#d4af37] text-black font-bold rounded-sm hover:bg-white active:scale-95 transition-all duration-300 text-xl shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Randevu Al
          </Link>
        </div>
      </div>
    </>
  );
}
