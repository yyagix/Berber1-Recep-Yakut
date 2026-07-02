"use server";

import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-posta ve şifre zorunludur." };
  }

  // TODO: Use bcrypt to verify password against DB.
  // For MVP/First setup, we hardcode the master password provided by LO or check DB.
  // "YgzEfeUnl_85!" was provided.
  
  // Let's check DB first. If DB is empty, we allow master password to bootstrap.
  const user = await prisma.user.findUnique({ where: { email } });
  
  let isValid = false;
  let role = "BARBER";

  if (user) {
    // If we had bcrypt: isValid = await bcrypt.compare(password, user.password)
    // Simple check for now:
    isValid = user.password === password;
    role = user.role;

    // Force upgrade the original master admin if they were created before SUPERADMIN role existed
    if (email === "admin@recepyakut.com" && role !== "SUPERADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "SUPERADMIN" }
      });
      role = "SUPERADMIN";
    }
  } else if (email === "admin@recepyakut.com" && password === "YgzEfeUnl_85!") {
    // Bootstrap Master Admin
    isValid = true;
    role = "SUPERADMIN";
    
    // Automatically create the superadmin in DB so future logins work
    await prisma.user.create({
      data: {
        email: "admin@recepyakut.com",
        password: "YgzEfeUnl_85!", // In production, this must be hashed!
        name: "Recep Yakut",
        role: "SUPERADMIN",
      }
    });
  }

  if (!isValid) {
    return { error: "Geçersiz e-posta veya şifre." };
  }

  // Create session
  const sessionData = { email, role, barberId: user?.barberId };
  const sessionToken = await encrypt(sessionData);

  (await cookies()).set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return { success: true };
}

export async function logoutAction() {
  (await cookies()).delete("session");
  return { success: true };
}
