"use client";

import { useState, useEffect } from "react";
import { getRequests } from "@/app/actions/request-actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ClipboardList,
  Calendar,
  User,
  Package,
  Printer,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";

type RequestData = Awaited<ReturnType<typeof getRequests>>[number];

const statusConfig = {
  menunggu: {
    label: "Menunggu",
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  disetujui: {
    label: "Disetujui",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  diserahkan: {
    label: "Diserahkan",
    icon: PackageCheck,
    badgeClass: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

export default function RiwayatPermintaanPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [search, statusFilter]);

  const loadRequests = async () => {
    try {
      const data = await getRequests({
        search: search || undefined,
        status: statusFilter !== "semua" ? statusFilter : undefined,
      });
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "menunggu").length;
  const approvedCount = requests.filter((r) => r.status === "disetujui").length;
  const handedOverCount = requests.filter((r) => r.status === "diserahkan").length;
  const rejectedCount = requests.filter((r) => r.status === "ditolak").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Riwayat Permintaan Barang
        </h1>
        <p className="text-slate-500 mt-1">
          Daftar seluruh transaksi pengajuan dan keputusan permintaan barang produksi
        </p>
      </div>

      {/* Filters & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari pemohon, keperluan, atau nama barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "semua")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="menunggu">Menunggu</SelectItem>
              <SelectItem value="disetujui">Disetujui</SelectItem>
              <SelectItem value="diserahkan">Diserahkan</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-2 text-xs font-medium self-end md:self-auto">
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
            Total: {requests.length}
          </span>
          <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200">
            Menunggu: {pendingCount}
          </span>
          <span className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
            Disetujui: {approvedCount}
          </span>
          <span className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-full border border-teal-200">
            Diserahkan: {handedOverCount}
          </span>
          <span className="bg-red-50 text-red-800 px-3 py-1.5 rounded-full border border-red-200">
            Ditolak: {rejectedCount}
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-slate-800">
                Belum ada permintaan
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Data permintaan yang pernah dibuat akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-16 text-center">ID</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Keperluan</TableHead>
                    <TableHead>Barang Diminta</TableHead>
                    <TableHead>Tanggal Permintaan</TableHead>
                    <TableHead>Penyetuju / Penolak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const config =
                      statusConfig[
                        req.status as keyof typeof statusConfig
                      ] || statusConfig.menunggu;

                    const initials = req.requester.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow
                        key={req.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground text-center font-bold">
                          #{req.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm text-slate-900">
                              {req.requester.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-[220px]" title={req.purpose || undefined}>
                            {req.purpose || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {req.requestItems.slice(0, 2).map((ri: any) => (
                              <span
                                key={ri.id}
                                className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                              >
                                {ri.item.name} ({ri.quantity} {ri.item.unit})
                              </span>
                            ))}
                            {req.requestItems.length > 2 && (
                              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                +{req.requestItems.length - 2} item lagi
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(req.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {req.reviewer ? (
                            <span className="font-medium text-slate-800">
                              {req.reviewer.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config.badgeClass} border`}>
                            <config.icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/riwayat-permintaan/${req.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                Detail
                              </Button>
                            </Link>
                            {(req.status === "disetujui" || req.status === "diserahkan") && (
                              <Link href={`/riwayat-permintaan/${req.id}?print=true`}>
                                <Button
                                  size="sm"
                                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 mr-1" />
                                  Cetak
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
