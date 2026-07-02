import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Sadece /admin altındaki yolları koru (login hariç)
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const session = request.cookies.get("session")?.value;
    
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    try {
      const parsed = await decrypt(session);
      if (!parsed) throw new Error("Geçersiz token");
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  
  // Login sayfasına giderken zaten session varsa, direkt admin anasayfasına at
  if (request.nextUrl.pathname === "/admin/login") {
    const session = request.cookies.get("session")?.value;
    if (session) {
      const parsed = await decrypt(session);
      if (parsed) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
