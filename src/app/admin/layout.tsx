import AdminSidebar from "@/components/admin/AdminSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ScrollProgress, ScrollToTop } from "@/components/ui/scroll-utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect admin routes
  if (!session || !session.user) {
    redirect("/login");
  }

  // Strictly enforce that only the super admin emails have access to the admin panel
  const adminEmails = ["adminscribe@gmail.com", "rahul77kumar77sharma77@gmail.com"];
  const userEmail = session?.user?.email;
  
  if (!userEmail || !adminEmails.includes(userEmail) || (session.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <>
      <ScrollProgress />
      <div className="fixed inset-0 flex bg-[#03030a] font-sans selection:bg-blue-700 selection:text-white overflow-hidden">
        {/* Sidebar — full height, nav scrolls internally */}
        <div className="flex-shrink-0 h-full">
          <AdminSidebar />
        </div>

        {/* Content — the ONLY scrollable area */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {children}
          </div>
        </main>
      </div>
      <ScrollToTop />
    </>
  );
}
