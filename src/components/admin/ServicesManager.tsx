"use client";

import { useState } from "react";
import { addServiceAction, deleteServiceAction } from "@/app/actions/services";
import toast from "react-hot-toast";

export default function ServicesManager({ barberId, initialServices }: { barberId: string, initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("barberId", barberId);
    
    const result = await addServiceAction(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setServices([...services, {
        id: Math.random().toString(),
        name: formData.get("name"),
        price: parseFloat(formData.get("price") as string),
        duration: parseInt(formData.get("duration") as string)
      }]);
      (e.target as HTMLFormElement).reset();
      toast.success("Hizmet başarıyla eklendi.");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    
    const result = await deleteServiceAction(id, barberId);
    if (!result.error) {
      setServices(services.filter(s => s.id !== id));
      toast.success("Hizmet silindi.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold font-heading text-white mb-6 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Hizmet Yönetimi
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm text-[#aaaaaa] mb-2">Hizmet Adı</label>
          <input type="text" name="name" required placeholder="Örn: Saç Kesimi" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <label className="block text-sm text-[#aaaaaa] mb-2">Fiyat (₺)</label>
          <input type="number" name="price" required placeholder="300" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <label className="block text-sm text-[#aaaaaa] mb-2">Süre (Dk)</label>
          <input type="number" name="duration" required placeholder="30" defaultValue="30" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <button type="submit" disabled={isLoading} className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            {isLoading ? "Ekleniyor..." : "Hizmet Ekle"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-[#666666] text-center py-4">Henüz hizmet eklenmemiş.</p>
        ) : (
          services.map(service => (
            <div key={service.id} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div>
                <h4 className="font-bold text-white">{service.name}</h4>
                <span className="text-sm text-[#888888]">{service.duration} Dk.</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#d4af37] font-bold text-lg">{service.price} ₺</span>
                <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
