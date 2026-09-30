import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { LiveDashboard } from "@/components/dashboard/LiveDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Visão Geral" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const initial = await getDashboardSnapshot(session!.user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Aqui está o resumo do monitoramento do seu familiar.
        </p>
      </div>

      <LiveDashboard initial={initial} />
    </div>
  );
}
