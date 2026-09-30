import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

// Consultado pelo dashboard a cada ~1,5 s para refletir eventos em tempo quase real.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const snapshot = await getDashboardSnapshot(session.user.id);
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}
