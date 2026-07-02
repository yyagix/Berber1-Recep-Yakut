"use server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function uploadGalleryImageAction(formData: FormData) {
  try {
    const barberId = formData.get("barberId") as string;
    const imageFile = formData.get("image") as File;

    if (!barberId || !imageFile || imageFile.size === 0) {
      return { error: "Lütfen bir resim seçin." };
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${barberId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from("galleries").upload(`portfolio/${fileName}`, imageFile);
    
    if (error) {
      console.error("Upload error:", error);
      return { error: "Resim yüklenemedi." };
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleries/portfolio/${fileName}`;

    await prisma.barber.update({
      where: { id: barberId },
      data: {
        gallery: {
          push: imageUrl
        }
      }
    });

    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (barber) {
      revalidatePath(`/${barber.slug}`);
    }
    revalidatePath(`/admin/barbers/${barberId}`);
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Bir hata oluştu" };
  }
}

export async function deleteGalleryImageAction(barberId: string, imageUrl: string) {
  try {
    // URL'den dosya adını çıkar
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1];

    // Supabase Storage'dan sil
    await supabase.storage.from("galleries").remove([`portfolio/${fileName}`]);

    // Veritabanından sil
    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (barber) {
      const newGallery = barber.gallery.filter(url => url !== imageUrl);
      await prisma.barber.update({
        where: { id: barberId },
        data: { gallery: newGallery }
      });
      revalidatePath(`/${barber.slug}`);
    }

    revalidatePath(`/admin/barbers/${barberId}`);
    return { success: true };
  } catch (error: any) {
    return { error: "Resim silinirken bir hata oluştu" };
  }
}
