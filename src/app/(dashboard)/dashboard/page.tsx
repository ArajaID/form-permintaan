import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { requests, items, stockMovements, notifications } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as any)?.role || "leader";

  if (role === "ga" || role === "purchasing") {
    redirect("/penyerahan-barang");
  }

  // Stats
  const totalItems = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .get();

  const pendingRequests = db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "menunggu"))
    .get();

  const approvedRequests = db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "disetujui"))
    .get();

  const rejectedRequests = db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "ditolak"))
    .get();

  const lowStockItems = db
    .select()
    .from(items)
    .where(sql`${items.stock} <= 5`)
    .all();

  const recentRequests = await db.query.requests.findMany({
    with: {
      requester: true,
      requestItems: { with: { item: true } },
    },
    orderBy: [desc(requests.createdAt)],
    limit: 5,
  });

  const recentMovements = await db.query.stockMovements.findMany({
    with: {
      item: true,
      createdByUser: true,
    },
    orderBy: [desc(stockMovements.createdAt)],
    limit: 5,
  });

  const stats = [
    {
      label: "Total Barang",
      value: totalItems?.count ?? 0,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      label: "Menunggu Persetujuan",
      value: pendingRequests?.count ?? 0,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
    {
      label: "Disetujui",
      value: approvedRequests?.count ?? 0,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      label: "Ditolak",
      value: rejectedRequests?.count ?? 0,
      icon: XCircle,
      color: "from-red-500 to-rose-500",
      shadowColor: "shadow-red-500/20",
    },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "menunggu":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Menunggu
          </Badge>
        );
      case "disetujui":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            Disetujui
          </Badge>
        );
      case "ditolak":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Ringkasan aktivitas permintaan dan stok barang
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Permintaan Terbaru</CardTitle>
                <CardDescription>5 permintaan terakhir</CardDescription>
              </div>
              <Link
                href="/riwayat-permintaan"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada permintaan
                </p>
              ) : (
                recentRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/riwayat-permintaan/${req.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {req.purpose || "Tanpa keterangan"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.requester.name} ·{" "}
                        {new Date(req.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {statusBadge(req.status)}
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Stok Rendah</CardTitle>
                <CardDescription>Barang dengan stok ≤ 5</CardDescription>
              </div>
              <Link
                href="/stok"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat Stok →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Semua stok dalam kondisi baik
                  </p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.unit}
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      {item.stock} {item.unit}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stock Movements */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pergerakan Stok Terbaru</CardTitle>
          <CardDescription>5 pergerakan stok terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada pergerakan stok
              </p>
            ) : (
              recentMovements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      mov.type === "masuk"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {mov.type === "masuk" ? (
                      <ArrowDownToLine className="w-4 h-4" />
                    ) : (
                      <ArrowUpFromLine className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{mov.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mov.createdByUser.name} ·{" "}
                      {new Date(mov.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        mov.type === "masuk"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {mov.type === "masuk" ? "+" : "-"}
                      {mov.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mov.item.unit}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
