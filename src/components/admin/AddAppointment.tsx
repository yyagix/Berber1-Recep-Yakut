"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { createAppointmentAction } from "@/app/actions/appointments";

const MOCK_SLOTS = [
  { time: "10:00", isFull: false },
  { time: "10:20", isFull: false },
  { time: "10:40", isFull: false },
  { time: "11:00", isFull: false },
  { time: "11:20", isFull: false },
  { time: "11:40", isFull: false },
  { time: "12:00", isFull: false },
  { time: "12:20", isFull: false },
  { time: "13:40", isFull: false },
  { time: "14:00", isFull: false },
  { time: "14:20", isFull: false },
  { time: "14:40", isFull: false },
  { time: "15:00", isFull: false },
  { time: "15:20", isFull: false },
  { time: "15:40", isFull: false },
  { time: "16:00", isFull: false },
  { time: "16:20", isFull: false },
  { time: "16:40", isFull: false },
  { time: "17:00", isFull: false },
  { time: "17:20", isFull: false },
  { time: "17:40", isFull: false },
  { time: "18:00", isFull: false },
  { time: "18:20", isFull: false },
  { time: "18:40", isFull: false },
  { time: "19:00", isFull: false },
  { time: "19:20", isFull: false },
  { time: "19:40", isFull: false }
];

export default function AddAppointment({ barbers }: { barbers: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Eğer tek berber varsa (Barber hesabı), otomatik seç
  useEffect(() => {
    if (barbers.length === 1 && !selectedBarberId) {
      setSelectedBarberId(barbers[0].id);
    }
  }, [barbers, selectedBarberId]);

  const selectedBarber = barbers.find(b => b.id === selectedBarberId);
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTime || !selectedServiceId || !selectedBarberId) {
      setError("Lütfen tarih, saat, berber ve hizmet seçin.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Numarayı normalize et
    let phone = formData.get("customerPhone") as string;
    if (phone && phone.length === 10 && !phone.startsWith("0")) {
      formData.set("customerPhone", "0" + phone);
    }

    formData.append("barberId", selectedBarberId);
    formData.append("serviceId", selectedServiceId);

    // Set time on the selected date
    const [hours, minutes] = selectedTime.split(":");
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours, 10));
    finalDate.setMinutes(parseInt(minutes, 10));
    finalDate.setSeconds(0);
    finalDate.setMilliseconds(0);

    // Using ISO string makes it easy for backend to parse reliably
    formData.append("dateTime", finalDate.toISOString());

    const result = await createAppointmentAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setSelectedTime(null);
      (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]"
      >
        + Manuel Randevu Ekle
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative my-8">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-[#aaaaaa] hover:text-white p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="text-3xl font-bold font-heading text-white mb-8">Yeni Randevu Ekle</h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#aaaaaa] mb-2 uppercase tracking-wider">Müşteri Adı</label>
              <input type="text" name="customerName" required className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="Örn: Ahmet Yılmaz" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#aaaaaa] mb-2 uppercase tracking-wider">Telefon</label>
              <input type="tel" name="customerPhone" required className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="05XX XXX XX XX" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#aaaaaa] mb-2 uppercase tracking-wider">Berber Seçimi</label>
              <select 
                value={selectedBarberId}
                onChange={(e) => {
                  setSelectedBarberId(e.target.value);
                  setSelectedServiceId("");
                }}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] appearance-none"
              >
                <option value="" disabled>Berber Seçin</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#aaaaaa] mb-2 uppercase tracking-wider">Hizmet Seçimi</label>
              <select 
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                disabled={!selectedBarberId}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] appearance-none disabled:opacity-50"
              >
                <option value="" disabled>Hizmet Seçin</option>
                {selectedBarber?.services?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.price}₺)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#aaaaaa] uppercase tracking-wider">Tarih Seçimi</label>
            <div className="flex gap-2 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {dates.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const dayName = format(date, "EE", { locale: tr }).toUpperCase();
                const dayNum = format(date, "d");
                const isClosed = date.getDay() === 0;

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

          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#aaaaaa] uppercase tracking-wider">Saat Seçimi</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {MOCK_SLOTS.map((slot, idx) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={slot.isFull}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`flex items-center justify-center h-12 rounded-xl border transition-all duration-300
                      ${isSelected 
                        ? "border-[#d4af37] bg-[#d4af37] text-black font-bold shadow-md" 
                        : slot.isFull 
                          ? "border-transparent bg-[#111111] opacity-30 cursor-not-allowed" 
                          : "border-white/5 bg-[#1a1a1a] hover:bg-[#222222] text-white"
                      }
                    `}
                  >
                    <span className="text-xs">{slot.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !selectedTime || !selectedServiceId}
            className="w-full h-14 bg-[#d4af37] text-black font-bold text-lg rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {isLoading ? "Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>
    </div>
  );
}
