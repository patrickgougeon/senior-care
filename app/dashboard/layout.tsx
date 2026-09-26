import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Belt-and-suspenders check (middleware already handles this, but here for safety)
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#EDE9E1]">
      <DashboardHeader userName={session.user?.name} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
