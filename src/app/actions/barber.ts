"use server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createBarberAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !email || !password) return { error: "İsim, E-posta ve Şifre zorunludur" };

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Bu e-posta adresi zaten kullanılıyor." };

    // Slug yoksa İsimden oluştur
    if (!slug) {
      const slugMap: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', ' ': '-' };
      slug = name.toLowerCase().replace(/[çğıöşü ]/g, m => slugMap[m] || "").replace(/[^a-z0-9-]/g, "");
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from("galleries").upload(`avatars/${fileName}`, imageFile);
      
      if (error) {
        console.error("Upload error:", error);
      } else if (data) {
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleries/avatars/${fileName}`;
      }
    }

    // Prisma Transaction ile Berber ve Kullanıcıyı aynı anda oluştur
    await prisma.$transaction(async (tx) => {
      const newBarber = await tx.barber.create({
        data: {
          name,
          slug,
          description,
          image: imageUrl,
        }
      });

      await tx.user.create({
        data: {
          name,
          email,
          password, // TODO: bcrypt.hash(password, 10) in production
          role: "BARBER",
          barberId: newBarber.id
        }
      });
    });

    revalidatePath("/admin/barbers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Create barber error:", error);
    return { error: error.message || "Bir hata oluştu" };
  }
}

export async function deleteBarberAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Find and delete the linked user if it exists
      const user = await tx.user.findUnique({ where: { barberId: id } });
      if (user) {
        await tx.user.delete({ where: { id: user.id } });
      }
      
      // Delete the barber (Services and Appointments will cascade automatically)
      await tx.barber.delete({ where: { id } });
    });

    revalidatePath("/admin/barbers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete barber error:", error);
    return { error: "Silinirken hata oluştu: " + (error.message || "") };
  }
}
