"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBarberAction } from "@/app/actions/barber";
import Link from "next/link";
import Image from "next/image";

export default function NewBarberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isCustomSlug) {
      const slugMap: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', ' ': '-' };
      const generated = val.toLowerCase().replace(/[çğıöşü ]/g, m => slugMap[m] || "").replace(/[^a-z0-9-]/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createBarberAction(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/admin/barbers");
    }
  };

  return (
    <div>
      <header className="mb-10 flex items-center gap-4">
        <Link href="/admin/barbers" className="p-2 text-[#aaaaaa] hover:text-white bg-[#111111] rounded-lg transition-colors border border-white/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Yeni Berber Ekle</h1>
          <p className="text-[#aaaaaa]">Sisteme yeni bir uzman ekleyin.</p>
        </div>
      </header>

      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-10 max-w-3xl shadow-xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Profil Fotoğrafı</label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/10 shrink-0">
                {previewImage ? (
                  <Image src={previewImage} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#666666]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label 
                  htmlFor="image-upload" 
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer border border-white/10 transition-colors text-sm inline-block"
                >
                  Görsel Seç
                </label>
                <p className="text-[#666666] text-xs mt-2">Önerilen boyut: Kare (500x500px). Maks 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Berber Adı ve Soyadı <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name" 
                required
                value={name}
                onChange={handleNameChange}
                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Örn: Emirhan Çınar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Profil Linki (Slug) <span className="text-red-500">*</span></label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-[#111111] border border-r-0 border-white/10 text-[#aaaaaa] rounded-l-xl text-sm">
                  site.com/
                </span>
                <input 
                  type="text" 
                  name="slug" 
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-r-xl px-5 py-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="emirhan-cinar"
                />
              </div>
              <p className="text-[#666666] text-xs mt-2">Sadece küçük İngilizce harfler, rakamlar ve tire (-) kullanılabilir.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Giriş E-postası <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                name="email" 
                required
                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="emirhan@recepyakut.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Giriş Şifresi <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="password" 
                required
                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Geçici bir şifre belirleyin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Hakkında (Biyografi)</label>
            <textarea 
              name="description" 
              rows={4}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
              placeholder="Berber hakkında kısa bir açıklama..."
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
            <Link href="/admin/barbers" className="px-6 py-3 bg-transparent text-white hover:bg-white/5 font-semibold rounded-xl transition-colors">
              İptal
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50"
            >
              {isLoading ? "Kaydediliyor..." : "Berberi Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
