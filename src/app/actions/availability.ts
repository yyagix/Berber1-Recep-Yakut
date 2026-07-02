"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAvailabilityAction(barberId: string, workingHours: any, dateOverrides: any, slotInterval: number) {
  try {
    const barber = await prisma.barber.update({
      where: { id: barberId },
      data: { workingHours, dateOverrides, slotInterval }
    });
    revalidatePath(`/admin/barbers/${barberId}`);
    revalidatePath(`/${barber.slug}`);
    return { success: true };
  } catch (error) {
    console.error("updateAvailabilityAction error:", error);
    return { error: "Çalışma saatleri güncellenirken hata oluştu" };
  }
}

export async function getAvailableSlotsAction(barberId: string, dateStr: string) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: { workingHours: true, dateOverrides: true, slotInterval: true }
    });
    if (!barber) return { slots: [] };

    const targetDate = new Date(dateStr);
    
    // First, check for date overrides!
    const yyyyMmDd = targetDate.toISOString().split("T")[0]; // local time handling might vary, but ISO is stable if parsed at midnight
    let overrideConfig = null;
    if (barber.dateOverrides && Array.isArray(barber.dateOverrides)) {
      overrideConfig = (barber.dateOverrides as any[]).find(o => o && typeof o === 'object' && o.date === yyyyMmDd);
    }

    let hoursSetting = null;

    if (overrideConfig) {
      hoursSetting = overrideConfig; // override has isWorking, start, end
    } else if (barber.workingHours) {
      const dayOfWeek = targetDate.getDay();
      hoursSetting = (barber.workingHours as any)[dayOfWeek.toString()];
    }

    if (!hoursSetting || !hoursSetting.isWorking) {
      return { slots: [] };
    }

    const { start, end } = hoursSetting;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        dateTime: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELLED" }
      },
      include: { service: true }
    });

    const bookedIntervals = appointments.map((appt: any) => {
      const apptTime = new Date(appt.dateTime);
      // Vercel server works in UTC (UTC+0). We need to calculate availability in Turkey time (UTC+3)
      const mStart = ((apptTime.getUTCHours() + 3) % 24) * 60 + apptTime.getUTCMinutes();
      const mEnd = mStart + (appt.service?.duration || 30);
      return { start: mStart, end: mEnd };
    });

    const slotInterval = barber.slotInterval || 30; // Use barber's interval
    const slots = [];

    // Note: Since service selection doesn't matter anymore, we just generate slots until endMinutes.
    // If a slot overlaps with ANY booked appointment, it is marked as full.
    const now = new Date();
    
    for (let t = startMinutes; t < endMinutes; t += slotInterval) {
      const tEnd = t + slotInterval;
      
      const h = Math.floor(t / 60);
      const m = t % 60;
      
      const slotDate = new Date(targetDate);
      slotDate.setHours(h, m, 0, 0);

      let isOverlap = bookedIntervals.some(b => {
        return Math.max(t, b.start) < Math.min(tEnd, b.end);
      });

      // Eğer geçmişte kalan bir saatse, dolu olarak işaretle
      if (slotDate < now) {
        isOverlap = true;
      }

      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      slots.push({ time: `${hStr}:${mStr}`, isFull: isOverlap });
    }

    return { slots };
  } catch (error) {
    console.error("Slots fetch error:", error);
    return { error: "Müsait saatler alınamadı." };
  }
}
