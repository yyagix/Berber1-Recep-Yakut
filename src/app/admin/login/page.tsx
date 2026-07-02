"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const result = await loginAction(formData);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-[#0a0a0a] to-[#0a0a0a]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold font-heading text-white tracking-tight">
            RECEP YAKUT
          </Link>
          <p className="text-[#d4af37] italic font-light mt-1">Admin Paneli</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Giriş Yap</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#aaaaaa] mb-2">E-posta Adresi</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="admin@recepyakut.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#aaaaaa] mb-2">Şifre</label>
              <input 
                type="password" 
                name="password"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-[#d4af37] text-black font-bold text-lg rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : "Giriş Yap"}
            </button>
          </form>
        </div>
        
        <p className="text-center text-[#666666] text-xs mt-8">
          &copy; {new Date().getFullYear()} Recep Yakut Hair Academy. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
