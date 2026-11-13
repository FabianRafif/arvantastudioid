import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#EDECE8] flex flex-col text-[#2D2D2D] selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      {/* Floating Pill Dashboard Header (Same concept as Gambar 2, retaining exact texts from Gambar 1) */}
      <DashboardHeader
        session={{
          userId: session.userId,
          username: session.username,
          fullName: session.fullName,
          role: session.role,
          email: session.email,
        }}
      />

      {/* Main Content with top padding so floating header never obscures content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="bg-transparent border-t border-[#D8D8D4] py-6 text-center text-xs text-[#787875] font-space">
        Arvanta Studio Customer Portal • Butuh bantuan cepat? WhatsApp{" "}
        <a
          href="https://wa.me/62895322465836"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF9857] hover:underline font-bold"
        >
          +62 895-3224-65836
        </a>
      </footer>
    </div>
  );
}
