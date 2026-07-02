"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addServiceAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration = parseInt(formData.get("duration") as string);
    const barberId = formData.get("barberId") as string;

    if (!name || isNaN(price) || isNaN(duration) || !barberId) {
      return { error: "Lütfen tüm alanları geçerli şekilde doldurun." };
    }

    await prisma.service.create({
      data: { name, price, duration, barberId }
    });

    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (barber) {
      revalidatePath(`/${barber.slug}`);
    }
    revalidatePath(`/admin/barbers/${barberId}`);
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Hizmet eklenirken bir hata oluştu" };
  }
}

export async function deleteServiceAction(id: string, barberId: string) {
  try {
    await prisma.service.delete({ where: { id } });
    
    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (barber) {
      revalidatePath(`/${barber.slug}`);
    }
    revalidatePath(`/admin/barbers/${barberId}`);
    
    return { success: true };
  } catch (error: any) {
    return { error: "Hizmet silinirken bir hata oluştu" };
  }
}
