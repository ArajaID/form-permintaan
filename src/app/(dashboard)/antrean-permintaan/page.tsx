"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getRequests,
  approveRequest,
  rejectRequest,
} from "@/app/actions/request-actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  Package,
  Calendar,
  Eye,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type RequestData = Awaited<ReturnType<typeof getRequests>>[number];

export default function AntreanPermintaanPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    requestId: number | null;
  }>({ open: false, requestId: null });
  const [rejectReason, setRejectReason] = useState("");

  const loadRequests = async () => {
    try {
      const data = await getRequests({ status: "menunggu", search: search || undefined });
      setRequests(data);
    } catch (error) {
      toast.error("Gagal memuat data permintaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [search]);

  const handleApprove = (requestId: number) => {
    startTransition(async () => {
      try {
        await approveRequest(requestId);
        toast.success("Permintaan berhasil disetujui!");
        loadRequests();
      } catch (error: any) {
        toast.error(error.message || "Gagal menyetujui permintaan");
      }
    });
  };

  const handleReject = () => {
    if (!rejectDialog.requestId) return;
    if (!rejectReason.trim()) {
      toast.error("Masukkan alasan penolakan terlebih dahulu");
      return;
    }

    startTransition(async () => {
      try {
        await rejectRequest(rejectDialog.requestId!, rejectReason);
        toast.success("Permintaan berhasil ditolak");
        setRejectDialog({ open: false, requestId: null });
        setRejectReason("");
        loadRequests();
      } catch (error: any) {
        toast.error(error.message || "Gagal menolak permintaan");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Antrean Permintaan
          </h1>
          <p className="text-slate-500 mt-1">
            Daftar pengajuan permintaan barang produksi yang membutuhkan persetujuan Anda
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto bg-amber-50 text-amber-900 border-amber-300 px-3.5 py-1.5 text-xs font-bold shadow-xs">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600 animate-pulse" />
          {requests.length} Pengajuan Menunggu
        </Badge>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari berdasarkan pemohon, keperluan, atau barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 shadow-xs border-slate-200 focus-visible:ring-blue-600 rounded-xl py-2.5"
        />
      </div>

      {/* Requests List with Spaced Out Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-bold text-slate-900">Tidak ada antrean pending</h3>
            <p className="text-slate-500 text-sm mt-1">
              Seluruh pengajuan permintaan barang produksi telah diproses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-7">
          {requests.map((req) => {
            const initials = req.requester.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card
                key={req.id}
                className="border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl bg-white overflow-hidden p-0"
              >
                {/* Header Bar */}
                <div className="bg-slate-50/90 px-7 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-200">
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-bold text-sm text-slate-900">{req.requester.name}</span>
                      <span className="text-xs text-slate-500 ml-2 hidden sm:inline font-medium">({req.requester.email})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs">
                      NGR-REQ-#{req.id}
                    </span>
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs px-3 py-1">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                      Menunggu Persetujuan
                    </Badge>
                  </div>
                </div>

                {/* Body Content - Spacious Padding & Gaps */}
                <div className="p-7 sm:p-8 space-y-6">
                  {/* Keperluan */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Keperluan Produksi
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {req.purpose || "Permintaan Barang Produksi"}
                    </h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-2 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Diajukan: {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </span>
                  </div>

                  {/* Rincian Barang Grid */}
                  <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-4 sm:p-5 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Rincian Barang Diminta ({req.requestItems.length} Jenis Barang)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {req.requestItems.map((ri: any) => (
                        <div
                          key={ri.id}
                          className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3 text-xs shadow-2xs"
                        >
                          <span className="font-semibold text-slate-900 flex items-center gap-2 truncate pr-2">
                            <Package className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate">{ri.item.name}</span>
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                            {ri.quantity} {ri.item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-slate-50/80 border-t border-slate-200/80 px-7 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <Link
                    href={`/riwayat-permintaan/${req.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Detail Lengkap & Dokumen A4 <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Bold Solid Red Reject Button */}
                    <Button
                      size="sm"
                      onClick={() => setRejectDialog({ open: true, requestId: req.id })}
                      disabled={isPending}
                      className="flex-1 sm:flex-initial h-10 px-6 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all border-0 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Tolak
                    </Button>

                    {/* Bold Solid Green Approve Button */}
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req.id)}
                      disabled={isPending}
                      className="flex-1 sm:flex-initial h-10 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all border-0 cursor-pointer"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      )}
                      Setujui
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          setRejectDialog({ open, requestId: open ? rejectDialog.requestId : null });
          if (!open) setRejectReason("");
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Tolak Permintaan Barang
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan resmi untuk pengajuan NGR-REQ-#{rejectDialog.requestId}. Alasan ini akan tercatat dan dikirim ke pemohon.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="Contoh: Stok di gudang tidak mencukupi / Alasan spesifik lainnya..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px] text-sm focus-visible:ring-rose-500 rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, requestId: null });
                setRejectReason("");
              }}
              className="rounded-xl border-slate-300 font-semibold"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Konfirmasi Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
