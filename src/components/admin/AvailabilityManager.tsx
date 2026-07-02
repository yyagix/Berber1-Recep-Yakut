"use client";

import { useState, useEffect, useRef } from "react";
import { updateAvailabilityAction } from "@/app/actions/availability";

import toast from "react-hot-toast";

const DAYS = [
  { key: "1", label: "Pazartesi" },
  { key: "2", label: "Salı" },
  { key: "3", label: "Çarşamba" },
  { key: "4", label: "Perşembe" },
  { key: "5", label: "Cuma" },
  { key: "6", label: "Cumartesi" },
  { key: "0", label: "Pazar" }
];

const DEFAULT_HOURS = {
  "1": { isWorking: true, start: "09:00", end: "21:00" },
  "2": { isWorking: true, start: "09:00", end: "21:00" },
  "3": { isWorking: true, start: "09:00", end: "21:00" },
  "4": { isWorking: true, start: "09:00", end: "21:00" },
  "5": { isWorking: true, start: "09:00", end: "21:00" },
  "6": { isWorking: true, start: "09:00", end: "21:00" },
  "0": { isWorking: false, start: "09:00", end: "21:00" }
};

export default function AvailabilityManager({ 
  barberId, 
  initialWorkingHours,
  initialDateOverrides = [],
  initialSlotInterval = 30
}: { 
  barberId: string, 
  initialWorkingHours: any,
  initialDateOverrides?: any,
  initialSlotInterval?: number
}) {
  const [workingHours, setWorkingHours] = useState(() => {
    if (!initialWorkingHours) return DEFAULT_HOURS;
    try {
      const parsed = typeof initialWorkingHours === 'string' ? JSON.parse(initialWorkingHours) : initialWorkingHours;
      return { ...DEFAULT_HOURS, ...parsed };
    } catch {
      return DEFAULT_HOURS;
    }
  });

  const [dateOverrides, setDateOverrides] = useState<any[]>(() => {
    if (!initialDateOverrides) return [];
    try {
      return typeof initialDateOverrides === 'string' ? JSON.parse(initialDateOverrides) : initialDateOverrides;
    } catch {
      return [];
    }
  });

  const [slotInterval, setSlotInterval] = useState(initialSlotInterval);
  
  const [newOverrideDate, setNewOverrideDate] = useState("");
  const [newOverrideIsWorking, setNewOverrideIsWorking] = useState(false);
  const [newOverrideStart, setNewOverrideStart] = useState("09:00");
  const [newOverrideEnd, setNewOverrideEnd] = useState("21:00");

  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const result = await updateAvailabilityAction(barberId, workingHours, dateOverrides, slotInterval);
      if (result.error) {
        toast.error("Otomatik kaydetme hatası: " + result.error);
      } else {
        toast.success("Değişiklikler kaydedildi.", { duration: 1500 });
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [workingHours, dateOverrides, slotInterval, barberId]);

  const handleToggleDay = (dayKey: string) => {
    setWorkingHours({
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        isWorking: !workingHours[dayKey].isWorking
      }
    });
  };

  const handleTimeChange = (dayKey: string, field: "start" | "end", value: string) => {
    setWorkingHours({
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        [field]: value
      }
    });
  };

  const handleAddOverride = () => {
    if (!newOverrideDate) return;
    const existing = dateOverrides.find((o) => o.date === newOverrideDate);
    if (existing) {
      toast.error("Bu tarih için zaten bir ayar var. Lütfen önce onu silin.");
      return;
    }

    setDateOverrides([
      ...dateOverrides,
      {
        date: newOverrideDate,
        isWorking: newOverrideIsWorking,
        start: newOverrideStart,
        end: newOverrideEnd
      }
    ]);

    setNewOverrideDate("");
    setNewOverrideIsWorking(false);
    setNewOverrideStart("09:00");
    setNewOverrideEnd("21:00");
  };

  const handleRemoveOverride = (date: string) => {
    setDateOverrides(dateOverrides.filter(o => o.date !== date));
  };


  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold font-heading text-white mb-6 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Çalışma Saatleri & Müsaitlik
      </h2>

      <div className="mb-8 border-b border-white/10 pb-8">
        <h3 className="text-xl font-bold text-white mb-4">Randevu Aralığı (Dakika)</h3>
        <p className="text-sm text-[#aaaaaa] mb-4">Takvimdeki saatlerin kaçar dakika arayla dizileceğini belirler (Örn: 15 yaparsanız saatler 09:00, 09:15, 09:30 olarak listelenir).</p>
        <select 
          value={slotInterval} 
          onChange={(e) => setSlotInterval(Number(e.target.value))}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
        >
          <option value={10}>10 Dakika</option>
          <option value={15}>15 Dakika</option>
          <option value={20}>20 Dakika</option>
          <option value={30}>30 Dakika</option>
          <option value={45}>45 Dakika</option>
          <option value={60}>60 Dakika</option>
        </select>
      </div>

      <div className="space-y-3 mb-8 border-b border-white/10 pb-8">
        <h3 className="text-xl font-bold text-white mb-4">Haftalık Rutin</h3>
        {DAYS.map((day) => {
          const config = workingHours[day.key];
          return (
            <div key={day.key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${config.isWorking ? "bg-[#1a1a1a] border-white/10" : "bg-[#111111] border-white/5 opacity-60"}`}>
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <button 
                  type="button"
                  onClick={() => handleToggleDay(day.key)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${config.isWorking ? "bg-[#d4af37]" : "bg-white/10"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.isWorking ? "left-7" : "left-1"}`} />
                </button>
                <span className="font-bold text-white w-24">{day.label}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="time" 
                  value={config.start} 
                  disabled={!config.isWorking}
                  style={{ colorScheme: "dark" }}
                  onChange={(e) => handleTimeChange(day.key, "start", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37] disabled:opacity-50 cursor-pointer"
                />
                <span className="text-[#666666]">-</span>
                <input 
                  type="time" 
                  value={config.end} 
                  disabled={!config.isWorking}
                  style={{ colorScheme: "dark" }}
                  onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37] disabled:opacity-50 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Özel Tarih Ayarları (İstisnalar)</h3>
        <p className="text-[#aaaaaa] text-sm mb-6">Bayramlar, tatiller veya ek mesai günleri için direkt tarih seçerek ayarlama yapabilirsiniz. Buradaki ayarlar haftalık rutini ezer.</p>
        
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 mb-6 flex flex-wrap md:flex-nowrap gap-4 items-end">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-bold text-[#aaaaaa] uppercase mb-2">Tarih</label>
            <input 
              type="date" 
              value={newOverrideDate}
              style={{ colorScheme: "dark" }}
              onChange={(e) => setNewOverrideDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker()}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-2 pb-3">
            <input 
              type="checkbox" 
              checked={newOverrideIsWorking}
              onChange={(e) => setNewOverrideIsWorking(e.target.checked)}
              className="w-5 h-5 accent-[#d4af37] rounded"
            />
            <span className="text-white text-sm font-bold">Çalışıyor</span>
          </div>
          
          {newOverrideIsWorking && (
            <div className="w-full md:w-auto flex gap-4">
              <div className="w-full md:w-28">
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase mb-2">Başlangıç</label>
                <input 
                  type="time" 
                  value={newOverrideStart}
                  style={{ colorScheme: "dark" }}
                  onChange={(e) => setNewOverrideStart(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="w-full bg-black border border-white/10 rounded-lg px-2 py-3 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                />
              </div>
              <div className="w-full md:w-28">
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase mb-2">Bitiş</label>
                <input 
                  type="time" 
                  value={newOverrideEnd}
                  style={{ colorScheme: "dark" }}
                  onChange={(e) => setNewOverrideEnd(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="w-full bg-black border border-white/10 rounded-lg px-2 py-3 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="w-full md:w-auto">
            <button 
              type="button" 
              onClick={handleAddOverride}
              className="w-full md:w-auto px-6 py-3 bg-[#333333] hover:bg-[#444] text-white font-bold rounded-lg transition-colors border border-white/10"
            >
              Ekle
            </button>
          </div>
        </div>

        {dateOverrides.length > 0 && (
          <div className="space-y-3">
            {dateOverrides.map((override, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#d4af37]">{override.date}</span>
                  {override.isWorking ? (
                    <span className="text-white text-sm bg-green-500/20 text-green-500 px-2 py-1 rounded">
                      Açık ({override.start} - {override.end})
                    </span>
                  ) : (
                    <span className="text-white text-sm bg-red-500/20 text-red-500 px-2 py-1 rounded">
                      Kapalı
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleRemoveOverride(override.date)}
                  className="text-red-500 hover:text-red-400 p-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
