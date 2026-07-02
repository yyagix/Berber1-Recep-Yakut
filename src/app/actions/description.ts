"use server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateDescriptionAction(formData: FormData) {
  try {
    const barberId = formData.get("barberId") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!barberId) return { error: "Berber ID eksik" };

    // Slug benzersizliğini kontrol et
    if (slug) {
      const existing = await prisma.barber.findUnique({ where: { slug } });
      if (existing && existing.id !== barberId) {
        return { error: "Bu profil linki (slug) zaten kullanılıyor. Lütfen başka bir tane seçin." };
      }
    }

    let imageUrl = undefined;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from("galleries").upload(`avatars/${fileName}`, imageFile);
      
      if (!error && data) {
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleries/avatars/${fileName}`;
      }
    }

    const barber = await prisma.barber.update({
      where: { id: barberId },
      data: { 
        description, 
        name, 
        slug,
        ...(imageUrl && { image: imageUrl })
      }
    });

    revalidatePath(`/${barber.slug}`);
    revalidatePath(`/admin/barbers/${barberId}`);
    revalidatePath("/admin/barbers");
    
    return { success: true };
  } catch (error: any) {
    return { error: "Profil güncellenirken hata oluştu" };
  }
}
