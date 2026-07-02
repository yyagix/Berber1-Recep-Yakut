import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  let role = "BARBER";
  let barberId = undefined;

  if (sessionToken) {
    const sessionData = await decrypt(sessionToken);
    if (sessionData) {
      role = sessionData.role || "BARBER";
      barberId = sessionData.barberId;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col w-full overflow-x-hidden">
      <AdminSidebar role={role} barberId={barberId} />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
