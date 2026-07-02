"use client";

import { useState } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";

export default function AppointmentStatus({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    const result = await updateAppointmentStatusAction(id, newStatus);
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "CONFIRMED": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "CANCELLED": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case "PENDING": return "Bekliyor";
      case "CONFIRMED": return "Onaylandı";
      case "CANCELLED": return "İptal Edildi";
      default: return s;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-1 md:gap-2">
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
        {getStatusText(status)}
      </div>
      
      <select 
        value="" 
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className="bg-transparent border border-white/10 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-[#d4af37]"
      >
        <option value="" disabled>Değiştir</option>
        {status !== "PENDING" && <option value="PENDING" className="text-black">Bekliyor</option>}
        {status !== "CONFIRMED" && <option value="CONFIRMED" className="text-black">Onayla</option>}
        {status !== "CANCELLED" && <option value="CANCELLED" className="text-black">İptal Et</option>}
      </select>
    </div>
  );
}
