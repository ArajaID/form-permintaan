"use client";

import { useState, useEffect, useTransition } from "react";
import { getRequests, handoverRequest } from "@/app/actions/request-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  Boxes,
  User,
  ShieldCheck,
  Calendar,
  Loader2,
  FileText,
  Package,
  Send,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { OfficialRequestPrintForm } from "@/components/official-request-print-form";

type RequestData = Awaited<ReturnType<typeof getRequests>>[number];

export default function PenyerahanBarangPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Handover Dialog State
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [handoverNote, setHandoverNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Print Modal State
  const [printModalRequest, setPrintModalRequest] = useState<RequestData | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      const data = await getRequests({ search: search || undefined });
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar permintaan");
    } finally {
      setLoading(false);
    }
  };

  const readyForHandover = requests.filter((r) => r.status === "disetujui");
  const handedOverList = requests.filter((r) => r.status === "diserahkan");

  const openHandoverModal = (req: RequestData) => {
    setSelectedRequest(req);
    setHandoverNote("");
    setDialogOpen(true);
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    startTransition(async () => {
      try {
        await handoverRequest(selectedRequest.id, handoverNote);
        toast.success(`Barang untuk Permintaan #${selectedRequest.id} berhasil diserahkan!`);
        setDialogOpen(false);
        setSelectedRequest(null);
        setHandoverNote("");
        loadData();
      } catch (err: any) {
        toast.error(err.message || "Gagal memproses penyerahan barang");
      }
    });
  };

  const [activeTab, setActiveTab] = useState<"ready" | "completed">("ready");

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Penyerahan Barang Produksi
              </h1>
              <p className="text-sm text-slate-500">
                Menu khusus Tim GA & Purchasing untuk memproses dan menandatangani penyerahan fisik barang
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari ID, pemohon, barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("ready")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === "ready"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Siap Diserahkan ({readyForHandover.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Riwayat Penyerahan ({handedOverList.length})
        </button>
      </div>

      {/* Tab 1: Siap Diserahkan */}
      {activeTab === "ready" && (
        <div className="space-y-4">
          {loading ? (
            <Card className="border border-slate-200/80 shadow-xs">
              <CardContent className="p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
                <p>Memuat daftar barang yang siap diserahkan...</p>
              </CardContent>
            </Card>
          ) : readyForHandover.length === 0 ? (
            <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Tidak Ada Antrean Penyerahan</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Semua permintaan barang yang disetujui supervisor telah diserahkan atau belum ada persetujuan baru.
                </p>
              </CardContent>
            </Card>
          ) : (
            readyForHandover.map((req) => (
              <Card key={req.id} className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white hover:border-emerald-200 transition-all">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-3.5 px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                        NGR-REQ-#{req.id}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-700">
                        {req.purpose || "Permintaan Barang Produksi"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        Disetujui Supervisor
                      </Badge>
                      <Button
                        onClick={() => openHandoverModal(req)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Serahkan Barang & TTD
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase">Pemohon:</span>
                      <p className="font-semibold text-slate-800">{req.requester.name} ({req.requester.email})</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase">Penyetuju Atasan:</span>
                      <p className="font-semibold text-slate-800">
                        {req.reviewer ? `${req.reviewer.name} (${req.reviewer.role === "supervisor" ? "Supervisor" : "PM"})` : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Item table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 text-[11px]">
                          <TableHead className="w-12 text-center font-bold">No</TableHead>
                          <TableHead className="font-bold">Nama Barang</TableHead>
                          <TableHead className="text-center font-bold">Satuan</TableHead>
                          <TableHead className="text-right font-bold">Kuantitas</TableHead>
                          <TableHead className="font-bold">Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {req.requestItems.map((ri: any, idx: number) => (
                          <TableRow key={ri.id} className="text-xs">
                            <TableCell className="text-center font-mono font-bold text-slate-400">{idx + 1}</TableCell>
                            <TableCell className="font-bold text-slate-900">{ri.item.name}</TableCell>
                            <TableCell className="text-center text-slate-600">{ri.item.unit}</TableCell>
                            <TableCell className="text-right font-extrabold text-emerald-700">{ri.quantity} {ri.item.unit}</TableCell>
                            <TableCell className="text-slate-500">{ri.note || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Sudah Diserahkan */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {handedOverList.length === 0 ? (
            <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
              <CardContent className="p-12 text-center text-slate-500">
                Belum ada riwayat penyerahan barang.
              </CardContent>
            </Card>
          ) : (
            handedOverList.map((req) => (
              <Card key={req.id} className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-3.5 px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-slate-600 bg-slate-100">
                        NGR-REQ-#{req.id}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-700">
                        {req.purpose || "Permintaan Barang Produksi"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        Barang Telah Diserahkan
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPrintModalRequest(req);
                          setPrintDialogOpen(true);
                        }}
                        className="text-xs rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Cetak Form Resmi (PDF)
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 uppercase">Pemohon:</span>
                      <p className="font-semibold text-slate-800">{req.requester.name}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase">Diserahkan Oleh:</span>
                      <p className="font-semibold text-slate-900">
                        {req.handedOverByUser ? req.handedOverByUser.name : "Tim Logistik"}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase">Waktu Penyerahan:</span>
                      <p className="font-semibold text-slate-800">
                        {req.handedOverAt
                          ? new Date(req.handedOverAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 text-[11px]">
                          <TableHead className="w-12 text-center font-bold">No</TableHead>
                          <TableHead className="font-bold">Nama Barang</TableHead>
                          <TableHead className="text-right font-bold">Jumlah Diserahkan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {req.requestItems.map((ri: any, idx: number) => (
                          <TableRow key={ri.id} className="text-xs">
                            <TableCell className="text-center font-mono font-bold text-slate-400">{idx + 1}</TableCell>
                            <TableCell className="font-bold text-slate-900">{ri.item.name}</TableCell>
                            <TableCell className="text-right font-extrabold text-emerald-700">{ri.quantity} {ri.item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Handover Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              Konfirmasi Penyerahan Barang Produksi
            </DialogTitle>
            <DialogDescription>
              Permintaan NGR-REQ-#{selectedRequest?.id} dari {selectedRequest?.requester.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleHandoverSubmit} className="space-y-4 py-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-600 uppercase">Rincian Barang yang Diserahkan:</span>
              <ul className="divide-y divide-slate-200">
                {selectedRequest?.requestItems.map((ri: any) => (
                  <li key={ri.id} className="py-1.5 flex justify-between">
                    <span className="font-semibold text-slate-800">{ri.item.name}</span>
                    <span className="font-bold text-emerald-700">{ri.quantity} {ri.item.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handover-note" className="text-xs font-bold uppercase text-slate-500">
                Catatan Penyerahan (Opsional)
              </Label>
              <Textarea
                id="handover-note"
                placeholder="Contoh: Barang telah diserahkan penuh di area gudang produksi..."
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                className="rounded-xl border-slate-200 text-sm min-h-[80px]"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Pengesahan Tanda Tangan Digital GA / Purchasing
              </p>
              <p>
                Dengan mengonfirmasi penyerahan ini, stempel TTD digital resmi atas nama akun Anda akan dibubuhkan secara otomatis pada dokumen fisik dan halaman verifikasi QR.
              </p>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-slate-300 font-semibold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Konfirmasi Penyerahan & TTD
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print Preview Modal */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Form Resmi Permintaan & Penyerahan Barang
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Pratinjau dokumen resmi A4 beserta stempel TTD Digital 3 pihak (Pemohon, Supervisor, & GA/Purchasing).
                </DialogDescription>
              </div>
              {printModalRequest && (
                <Button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 self-start sm:self-auto cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak PDF Sekarang
                </Button>
              )}
            </div>
          </DialogHeader>

          {printModalRequest && (
            <div className="py-4 bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-x-auto">
              <OfficialRequestPrintForm request={printModalRequest} />
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            <p className="text-xs text-slate-400">
              *Klik &quot;Cetak PDF Sekarang&quot; untuk mengunduh atau mencetak dokumen resmi A4.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrintDialogOpen(false)}
                className="rounded-xl border-slate-300 font-semibold cursor-pointer"
              >
                Tutup
              </Button>
              {printModalRequest && (
                <Button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak PDF
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formal A4 Document Layout for Print */}
      <div className="print-only">
        {printModalRequest && <OfficialRequestPrintForm request={printModalRequest} />}
      </div>
    </div>
  );
}
