// PLACE AT: app/admin/stations/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/getUser";
import { isAdmin } from "@/lib/auth/adminCheck";
import AdminStationsClient from "@/components/charging-stations/AdminStationsClient";

export default async function AdminStationsPage() {
  // ⚠️  SECURITY: Verify admin access before loading sensitive data
  const session = await getServerSession();
  if (!session) return notFound();
  
  const userIsAdmin = await isAdmin(session.userId);
  if (!userIsAdmin) return notFound();

  const [pending, approved, all] = await Promise.all([
    prisma.chargingStation.count({ where: { status: "pending"  } }),
    prisma.chargingStation.count({ where: { status: "approved" } }),
    prisma.chargingStation.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { stationReviews: { select: { rating: true } } },
    }),
  ]);

  const stations = all.map((s) => ({
    ...s,
    avgRating: s.stationReviews.length
      ? s.stationReviews.reduce((sum, r) => sum + r.rating, 0) / s.stationReviews.length
      : null,
  }));

  return (
    <AdminStationsClient
      stations={stations}
      stats={{ pending, approved, total: all.length }}
    />
  );
}