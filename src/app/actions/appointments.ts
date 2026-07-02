"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAppointmentAction(formData: FormData) {
  try {
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const dateTimeStr = formData.get("dateTime") as string;
    const barberId = formData.get("barberId") as string;
    const serviceId = formData.get("serviceId") as string;

    if (!customerName || !customerPhone || !dateTimeStr || !barberId || !serviceId) {
      return { error: "Lütfen tüm alanları doldurun." };
    }

    const parsedDate = new Date(dateTimeStr);

    // Çifte rezervasyon koruması
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        dateTime: parsedDate,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    if (existingAppointment) {
      return { error: "Seçtiğiniz saat az önce başka bir müşteri tarafından rezerve edildi. Lütfen başka bir saat seçiniz." };
    }

    await prisma.appointment.create({
      data: {
        customerName,
        customerPhone,
        dateTime: parsedDate,
        barberId,
        serviceId,
        status: "CONFIRMED" // admin manually added, so confirmed by default
      }
    });

    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (error) {
    return { error: "Randevu eklenirken hata oluştu." };
  }
}

export async function updateAppointmentStatusAction(id: string, status: string) {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (error) {
    return { error: "Durum güncellenirken hata oluştu" };
  }
}

export async function getCustomerAppointmentsAction(phone: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customerPhone: phone },
      include: {
        barber: {
          select: { name: true, slug: true, image: true }
        },
        service: {
          select: { name: true, price: true, duration: true }
        }
      },
      orderBy: {
        dateTime: "desc"
      }
    });
    
    return { success: true, appointments };
  } catch (error) {
    return { error: "Randevular getirilirken hata oluştu." };
  }
}

export async function cancelCustomerAppointmentAction(id: string, phone: string) {
  try {
    // Sadece o telefona ait ve iptal edilmemiş randevuyu bul
    const appt = await prisma.appointment.findFirst({
      where: { id, customerPhone: phone, status: { not: "CANCELLED" } }
    });

    if (!appt) {
      return { error: "Randevu bulunamadı veya yetkisiz işlem." };
    }

    // Geçmiş randevu iptal edilemez (şu anki zamandan önceyse)
    if (new Date(appt.dateTime) < new Date()) {
      return { error: "Geçmiş randevular iptal edilemez." };
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/admin/appointments");
    // randevularım sayfası client side data fetching yapacak muhtemelen, ama revalidatePath iyi olabilir.
    
    return { success: true };
  } catch (error) {
    return { error: "Randevu iptal edilirken hata oluştu." };
  }
}
