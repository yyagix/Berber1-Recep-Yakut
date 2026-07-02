"use client";

import { useState, useEffect, useRef } from "react";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { getAvailableSlotsAction } from "@/app/actions/availability";
import { createAppointmentAction } from "@/app/actions/appointments";
import Link from "next/link";
import toast from "react-hot-toast";

export default function BookingForm({ barberId, barberServices, workingHours, dateOverrides }: { barberId: string, barberServices: any[], workingHours: any, dateOverrides?: any }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  
  const [slots, setSlots] = useState<{time: string, isFull: boolean}[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [success, setSuccess] = useState(false);

  const selectedService = barberServices.find(s => s.id === selectedServiceId);
  const duration = selectedService?.duration || 30;

  const parsedHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : (workingHours || {});
  const parsedOverrides = typeof dateOverrides === 'string' ? JSON.parse(dateOverrides) : (dateOverrides || []);

  useEffect(() => {
    async function fetchSlots() {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const overrideConfig = parsedOverrides.find((o: any) => o.date === dateStr);
      const dayKey = selectedDate.getDay().toString();
      const dayConfig = parsedHours[dayKey];
      
      let isWorking = false;
      if (overrideConfig) {
        isWorking = overrideConfig.isWorking;
      } else if (dayConfig) {
        isWorking = dayConfig.isWorking;
      }
      
      if (!isWorking) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      const res = await getAvailableSlotsAction(barberId, selectedDate.toISOString());
      if (res.slots) {
        setSlots(res.slots);
      } else {
        setSlots([]);
      }
      setIsLoadingSlots(false);
      setSelectedTime(null);
    }

    fetchSlots();
  }, [selectedDate, barberId]);

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTime || !selectedServiceId) return;
    
    // Anında (senkron) double-click koruması
    if (isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Numarayı normalize et
    let phone = formData.get("customerPhone") as string;
    if (phone && phone.length === 10 && !phone.startsWith("0")) {
      formData.set("customerPhone", "0" + phone);
    }

    formData.append("barberId", barberId);
    formData.append("serviceId", selectedServiceId);

    const [hours, minutes] = selectedTime.split(":");
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    formData.append("dateTime", finalDate.toISOString());

    const result = await createAppointmentAction(formData);

    if (result.error) {
      toast.error(result.error);
      isSubmittingRef.current = false;
    } else {
      setSuccess(true);
      // Re-fetch slots to update availability instantly
      const res = await getAvailableSlotsAction(barberId, selectedDate.toISOString());
      if (res.slots) setSlots(res.slots);
      isSubmittingRef.current = false;
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-[#121212] border border-[#d4af37]/30 rounded-2xl p-8 sticky top-24 text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 font-heading tracking-tight text-white">Randevunuz Alındı!</h2>
        <p className="text-muted-foreground mb-6 text-sm">Bizi tercih ettiğiniz için teşekkür ederiz. Randevunuz başarıyla oluşturuldu.</p>
        <div className="flex flex-col gap-3 max-w-[200px] mx-auto">
          <Link href="/randevularim" className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-colors text-sm shadow-md">
            Randevularımı Gör
          </Link>
          <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-sm">
            Yeni Randevu Al
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 sticky top-24 text-foreground shadow-2xl">
      <h2 className="text-3xl font-bold mb-8 font-heading tracking-tight">Randevu Al</h2>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* Service Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-4 text-lg font-bold tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 text-muted-foreground text-sm">1</span>
            Hizmet Seçin
          </label>
          <select 
            required
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full h-14 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-[#d4af37] transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Lütfen bir hizmet seçin</option>
            {barberServices.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price} ₺ ({service.duration} Dk)
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-4 text-lg font-bold tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 text-muted-foreground text-sm">2</span>
            Tarih Seçin
          </label>
          
          <div className="flex gap-2 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {dates.map((date, idx) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const dayName = format(date, "EE", { locale: tr }).toUpperCase();
              const dayNum = format(date, "d");
              
              const dateStr = format(date, "yyyy-MM-dd");
              const overrideConfig = parsedOverrides.find((o: any) => o.date === dateStr);
              const dayKey = date.getDay().toString();
              const dayConfig = parsedHours[dayKey];
              
              let isClosed = false;
              if (overrideConfig) {
                isClosed = !overrideConfig.isWorking;
              } else {
                isClosed = !dayConfig || !dayConfig.isWorking;
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isClosed}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-none snap-start flex flex-col items-center justify-center w-[72px] h-[88px] rounded-xl border transition-all duration-300
                    ${isSelected 
                      ? "border-[#d4af37] bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.25)]" 
                      : isClosed 
                        ? "border-transparent bg-[#111111] opacity-40 cursor-not-allowed" 
                        : "border-white/5 bg-[#1a1a1a] hover:bg-[#222222] text-[#888] hover:text-white"
                    }
                  `}
                >
                  <span className={`text-[10px] font-bold tracking-widest mb-1 ${isSelected ? "text-black/80" : ""}`}>{dayName}</span>
                  <span className={`text-2xl font-bold font-heading ${isSelected ? "text-black" : "text-white"}`}>{dayNum}</span>
                  {isClosed && <span className="text-[9px] mt-1 font-bold tracking-wider text-red-900/50 uppercase">Kapalı</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-4 text-lg font-bold tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 text-muted-foreground text-sm">3</span>
            Saat Seçin
          </label>
          
          {isLoadingSlots ? (
            <div className="text-center p-6 border border-white/5 rounded-xl bg-[#1a1a1a] animate-pulse">
              <p className="text-[#888]">Müsait saatler kontrol ediliyor...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center p-6 border border-white/5 rounded-xl bg-[#1a1a1a]">
              <p className="text-[#888]">Bu gün için uygun randevu saati bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map((slot, idx) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={slot.isFull}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`flex flex-col items-center justify-center h-14 rounded-xl border transition-all duration-300
                      ${isSelected 
                        ? "border-[#d4af37] bg-[#d4af37] text-black shadow-md" 
                        : slot.isFull 
                          ? "border-transparent bg-[#111111] opacity-30 cursor-not-allowed" 
                          : "border-white/5 bg-[#1a1a1a] hover:bg-[#222222] text-white"
                      }
                    `}
                  >
                    <span className={`font-bold text-sm ${isSelected ? "text-black" : slot.isFull ? "text-[#555]" : "text-white"}`}>{slot.time}</span>
                    {slot.isFull && <span className="text-[9px] uppercase font-bold mt-0.5 tracking-wider text-[#444]">Dolu</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Final Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="space-y-2">
            <label htmlFor="customerName" className="text-xs font-bold uppercase tracking-wider text-[#888]">Adınız Soyadınız</label>
            <input 
              type="text" 
              id="customerName" 
              name="customerName" 
              required
              minLength={3}
              className="w-full h-12 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customerPhone" className="text-xs font-bold uppercase tracking-wider text-[#888]">Telefon Numaranız</label>
            <input 
              type="tel" 
              id="customerPhone" 
              name="customerPhone" 
              required
              minLength={10}
              maxLength={11}
              className="w-full h-12 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="05XX XXX XX XX"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!selectedTime || !selectedServiceId || isSubmitting}
          className="w-full h-14 bg-[#d4af37] text-black font-bold text-lg rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
        >
          {isSubmitting ? "Onaylanıyor..." : "Randevuyu Onayla"}
        </button>
      </form>
    </div>
  );
}
