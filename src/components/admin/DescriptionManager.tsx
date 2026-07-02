"use client";

import { useState } from "react";
import { updateDescriptionAction } from "@/app/actions/description";
import toast from "react-hot-toast";

export default function DescriptionManager({ 
  barberId, 
  initialName,
  initialSlug,
  initialDescription 
}: { 
  barberId: string, 
  initialName: string,
  initialSlug: string,
  initialDescription: string | null 
}) {
  const [name, setName] = useState(initialName || "");
  const [slug, setSlug] = useState(initialSlug || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomSlug, setIsCustomSlug] = useState(!!initialSlug);

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
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Profil fotoğrafı en fazla 10MB olabilir.");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("barberId", barberId);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    const result = await updateDescriptionAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profil bilgileri başarıyla güncellendi.");
      if (image) {
        setTimeout(() => window.location.reload(), 1000); // Reload to show new avatar in header
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold font-heading text-white mb-6 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Profil Bilgileri
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Berber Adı ve Soyadı</label>
            <input 
              type="text" 
              value={name}
              onChange={handleNameChange}
              required
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Profil Linki (Slug)</label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-[#111111] border border-r-0 border-white/10 text-[#aaaaaa] rounded-l-xl text-sm">
                site.com/
              </span>
              <input 
                type="text" 
                value={slug}
                onChange={handleSlugChange}
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-r-xl px-5 py-4 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <p className="text-[#666666] text-xs mt-2">Sadece küçük İngilizce harfler, rakamlar ve tire (-) kullanılabilir.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Profil Fotoğrafı (İsteğe Bağlı)</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/20 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#d4af37] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-black hover:file:bg-white cursor-pointer"
              />
              <p className="text-[#666666] text-xs mt-2">Yeni bir fotoğraf seçerseniz mevcut profil fotoğrafınız değiştirilir.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Hakkında (Biyografi)</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Berber hakkında kısa bir açıklama..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#d4af37] resize-none"
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isLoading} className="px-8 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            {isLoading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
