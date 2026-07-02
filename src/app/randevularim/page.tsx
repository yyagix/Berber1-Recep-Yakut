"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { getCustomerAppointmentsAction, cancelCustomerAppointmentAction } from "@/app/actions/appointments";

type Appointment = {
  id: string;
  dateTime: Date;
  status: string;
  customerName: string;
  barber: { name: string; slug: string; image: string | null };
  service: { name: string; price: number; duration: number };
};

export default function MyAppointmentsPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Numarayı normalize et: Başında 0 yoksa ekle
    let normalizedPhone = phone;
    if (normalizedPhone.length === 10 && !normalizedPhone.startsWith("0")) {
      normalizedPhone = "0" + normalizedPhone;
      setPhone(normalizedPhone); // update state so handleCancel uses the correct one
    }

    if (normalizedPhone.length < 10) {
      toast.error("Lütfen geçerli bir telefon numarası girin.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const result = await getCustomerAppointmentsAction(normalizedPhone);
    if (result.error) {
      toast.error(result.error);
    } else if (result.appointments) {
      setAppointments(result.appointments as Appointment[]);
    }
    setIsLoading(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Randevunuzu iptal etmek istediğinize emin misiniz?")) return;

    const toastId = toast.loading("Randevu iptal ediliyor...");
    const result = await cancelCustomerAppointmentAction(id, phone);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Randevunuz başarıyla iptal edildi.", { id: toastId });
      // Update local state
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
    }
  };

  const now = new Date();
  const futureAppointments = appointments.filter(a => new Date(a.dateTime) > now && a.status !== "CANCELLED");
  const pastOrCancelledAppointments = appointments.filter(a => new Date(a.dateTime) <= now || a.status === "CANCELLED");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary pt-24 pb-20">
      <header className="border-b border-white/5 py-6 px-6 bg-[#111111]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading text-white">Randevularım</h1>
          <Link href="/" className="text-sm font-bold text-[#aaaaaa] hover:text-[#d4af37] transition-colors flex items-center gap-2">
            &larr; Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-[#111111] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl mb-12">
          <h2 className="text-3xl font-bold font-heading text-white mb-4 text-center">Randevu Sorgulama</h2>
          <p className="text-[#888888] text-center mb-8 max-w-lg mx-auto">
            Geçmiş ve gelecek randevularınızı görmek veya yaklaşan randevularınızı iptal etmek için randevu alırken kullandığınız telefon numarasını girin.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="tel" 
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              minLength={10}
              maxLength={11}
              required
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors text-lg tracking-wider text-center md:text-left"
            />
            <button 
              type="submit" 
              disabled={isLoading || phone.length < 10}
              className="px-8 py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-70 shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sorgulanıyor...
                </>
              ) : "Sorgula"}
            </button>
          </form>
        </div>

        {hasSearched && !isLoading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {appointments.length === 0 ? (
              <div className="text-center bg-[#111111] border border-white/5 p-12 rounded-2xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" className="mx-auto mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <h3 className="text-xl font-bold text-white mb-2">Randevu Bulunamadı</h3>
                <p className="text-[#888888]">Bu numaraya ait herhangi bir randevu kaydına rastlanmadı.</p>
              </div>
            ) : (
              <>
                {/* Gelecek Randevular */}
                <div>
                  <h3 className="text-2xl font-bold font-heading text-[#d4af37] mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#d4af37] animate-pulse"></span>
                    Yaklaşan Randevularınız
                  </h3>
                  
                  {futureAppointments.length === 0 ? (
                    <p className="text-[#666666] italic bg-[#111111] p-6 rounded-xl border border-white/5">Yaklaşan aktif bir randevunuz bulunmuyor.</p>
                  ) : (
                    <div className="grid gap-6">
                      {futureAppointments.map((appt) => (
                        <div key={appt.id} className="bg-[#111111] border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
                          <div className="flex items-center gap-4 pl-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/10 flex items-center justify-center">
                              {appt.barber.image ? (
                                <Image src={appt.barber.image} alt={appt.barber.name} width={48} height={48} className="object-cover w-full h-full" />
                              ) : (
                                <span className="text-white text-xl font-bold">{appt.barber.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <Link href={`/${appt.barber.slug}`} className="text-white font-semibold hover:text-[#d4af37] transition-colors">
                                {appt.barber.name}
                              </Link>
                              <div className="text-[#666666] text-sm">{appt.service.name} ({appt.service.price} ₺)</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <div className="text-[#d4af37] font-bold text-sm">
                                {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(appt.dateTime))}
                              </div>
                              <div className="text-white font-semibold text-xs">
                                {new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(appt.dateTime))}
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleCancel(appt.id)}
                              className="px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 text-xs shadow-sm"
                            >
                              İptal Et
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Geçmiş / İptal Edilen Randevular */}
                <div>
                  <h3 className="text-2xl font-bold font-heading text-white mb-6 border-b border-white/10 pb-4">
                    Geçmiş İşlemler
                  </h3>
                  
                  {pastOrCancelledAppointments.length > 0 && (
                    <div className="grid gap-4">
                      {pastOrCancelledAppointments.map((appt) => (
                        <div key={appt.id} className="bg-[#111111] border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/10 flex items-center justify-center">
                              {appt.barber.image ? (
                                <Image src={appt.barber.image} alt={appt.barber.name} width={48} height={48} className="object-cover w-full h-full grayscale" />
                              ) : (
                                <span className="text-white text-xl font-bold">{appt.barber.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{appt.barber.name}</div>
                              <div className="text-[#666666] text-sm">{appt.service.name}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <div className="text-[#aaaaaa] text-sm">
                                {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(appt.dateTime))}
                              </div>
                              <div className="text-[#666666] text-xs">
                                {new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(appt.dateTime))}
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              appt.status === "CANCELLED" ? "bg-red-500/10 text-red-500" :
                              appt.status === "COMPLETED" ? "bg-green-500/10 text-green-500" :
                              "bg-white/5 text-[#888888]"
                            }`}>
                              {appt.status === "CANCELLED" ? "İptal Edildi" : 
                               appt.status === "COMPLETED" ? "Tamamlandı" : "Geçmiş"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
