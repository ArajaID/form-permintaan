import { getRequestById } from "@/app/actions/request-actions";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Package,
  User,
  Calendar,
  FileText,
  ShieldCheck,
  Tag,
  Boxes,
} from "lucide-react";
import Link from "next/link";
import { PrintButton } from "./print-button";
import { DigitalSignatureStamp } from "@/components/digital-signature";

const statusConfig = {
  menunggu: {
    label: "Menunggu Persetujuan",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  disetujui: {
    label: "Disetujui Supervisor",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  diserahkan: {
    label: "Barang Diserahkan",
    icon: CheckCircle2,
    className: "bg-teal-100 text-teal-800 border-teal-200",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export default async function DetailPermintaanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestById(parseInt(id));

  if (!request) {
    notFound();
  }

  const config =
    statusConfig[request.status as keyof typeof statusConfig] ||
    statusConfig.menunggu;

  const requesterInitials = request.requester.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const reviewerInitials = request.reviewer
    ? request.reviewer.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const totalItemsCount = request.requestItems.length;
  const totalQuantity = request.requestItems.reduce(
    (sum: number, ri: any) => sum + ri.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/riwayat-permintaan"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Kembali ke Riwayat
        </Link>
        <PrintButton status={request.status} />
      </div>

      {/* Main Request Information Card */}
      <Card className="no-print border-0 shadow-lg">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border-blue-200">
                  ID PERMINTAAN #{request.id}
                </Badge>
                <span className="text-xs text-slate-400">
                  {new Date(request.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </span>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1">
                {request.purpose || "Permintaan Barang Produksi"}
              </CardTitle>
            </div>
            <Badge className={`${config.className} border text-xs px-3 py-1 font-semibold self-start sm:self-auto`}>
              <config.icon className="w-3.5 h-3.5 mr-1.5" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pemohon Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Informasi Pemohon
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                      {requesterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{request.requester.name}</p>
                    <p className="text-xs text-slate-500">{request.requester.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tanggal Pengajuan
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {new Date(request.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Penyetuju / Status Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Informasi Keputusan Atasan
                </p>
                {request.reviewer ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                        {reviewerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{request.reviewer.name}</p>
                      <p className="text-xs text-slate-500">{request.reviewer.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800 text-xs">
                    Permintaan ini sedang menunggu pemeriksaan dari Supervisor atau Plant Manager.
                  </div>
                )}
              </div>

              {request.reviewedAt && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Tanggal Keputusan
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {new Date(request.reviewedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}

              {request.reason && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Alasan / Catatan Keputusan
                  </p>
                  <p className="text-sm font-medium text-slate-700 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {request.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rincian Barang Diminta Table Card */}
      <Card className="no-print border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-slate-100 py-4 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Daftar Rincian Barang Diminta
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar barang dan kuantitas yang diajukan untuk produksi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-xs">
                {totalItemsCount} Jenis Barang
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs">
                Total: {totalQuantity} Unit
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-200/80">
                  <TableHead className="w-14 text-center font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3.5">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3.5">
                    Nama Barang
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3.5">
                    Satuan
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3.5">
                    Jumlah Diminta
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3.5">
                    Catatan / Keperluan Khusus
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {request.requestItems.map((ri: any, index: number) => (
                  <TableRow
                    key={ri.id}
                    className="hover:bg-slate-50/60 transition-all duration-150"
                  >
                    <TableCell className="text-center font-mono text-xs font-semibold text-slate-400">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-200/60">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm text-slate-900">
                          {ri.item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200/60">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {ri.item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm border border-blue-200/70 shadow-xs">
                        {ri.quantity} {ri.item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 py-3.5">
                      {ri.note ? (
                        <span className="text-slate-700 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-md text-xs font-medium inline-block">
                          {ri.note}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Summary Footer */}
          <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Menampilkan {totalItemsCount} item barang yang diajukan</span>
            <div className="flex items-center gap-3">
              <span>
                Total Keseluruhan Kuantitas:{" "}
                <strong className="text-slate-900 font-bold text-sm ml-1">
                  {totalQuantity} Unit
                </strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ultra-Professional Formal A4 Document Layout for Print */}
      <div className="print-only" style={{ fontFamily: "Arial, sans-serif", width: "100%", margin: "0", padding: "0" }}>
        {/* Kop Surat Perusahaan */}
        <div style={{ borderBottom: "3px double #000", paddingBottom: "10px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0", letterSpacing: "0.5px", color: "#000" }}>
                PT UNINDO AJIDHARMA INDUSTRY
              </h1>
              <p style={{ fontSize: "8.5pt", color: "#555", margin: "2px 0 0 0" }}>
                Divisi Manufaktur & Sistem Permintaan Barang Produksi
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0", textTransform: "uppercase", textDecoration: "underline" }}>
                FORM PERMINTAAN BARANG PRODUKSI
              </h2>
              <p style={{ fontSize: "9.5pt", fontWeight: "bold", margin: "4px 0 0 0", color: "#000" }}>
                No. Registrasi: NGR-REQ-#{request.id}
              </p>
              <p style={{ fontSize: "8pt", color: "#444", margin: "2px 0 0 0" }}>
                Tgl Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>
        </div>

        {/* Structured Information Grid */}
        <div style={{ marginBottom: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", border: "1.5px solid #000", background: "#ffffff" }}>
            <tbody>
              <tr>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", width: "18%", fontWeight: "bold", background: "#ffffff" }}>No. Permintaan</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", width: "32%", fontWeight: "bold", background: "#ffffff" }}>NGR-REQ-#{request.id}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", width: "18%", fontWeight: "bold", background: "#ffffff" }}>Tanggal Pengajuan</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", width: "32%", background: "#ffffff" }}>
                  {new Date(request.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ({new Date(request.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB)
                </td>
              </tr>
              <tr>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Pemohon (Leader)</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>{request.requester.name} ({request.requester.email})</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Status Persetujuan</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", textTransform: "uppercase", background: "#ffffff" }}>{config.label}</td>
              </tr>
              <tr>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Keperluan Produksi</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>{request.purpose || "-"}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Penyetuju (Supervisor/PM)</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>
                  {request.reviewer ? `${request.reviewer.name} (${request.reviewer.email})` : "-"}
                </td>
              </tr>
              {request.reviewedAt && (
                <tr>
                  <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Tanggal Keputusan</td>
                  <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>
                    {new Date(request.reviewedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td style={{ border: "1.5px solid #000", padding: "6px 8px", fontWeight: "bold", background: "#ffffff" }}>Catatan Keputusan</td>
                  <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>{request.reason || "-"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Goods Detail Table */}
        <div style={{ marginBottom: "6px", fontWeight: "bold", fontSize: "9.5pt" }}>
          RINCIAN BARANG PRODUKSI YANG DIMINTA:
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginBottom: "25px", background: "#ffffff" }}>
          <thead>
            <tr style={{ background: "#ffffff" }}>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "35px", textAlign: "center", background: "#ffffff" }}>NO</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", textAlign: "left", background: "#ffffff" }}>NAMA BARANG PRODUKSI</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "80px", textAlign: "center", background: "#ffffff" }}>SATUAN</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "110px", textAlign: "right", background: "#ffffff" }}>JUMLAH DIMINTA</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", textAlign: "left", background: "#ffffff" }}>CATATAN / SPESIFIKASI KHUSUS</th>
            </tr>
          </thead>
          <tbody>
            {request.requestItems.map((ri: any, idx: number) => (
              <tr key={ri.id} style={{ background: "#ffffff" }}>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>{idx + 1}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", fontWeight: "bold", background: "#ffffff" }}>{ri.item.name}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>{ri.item.unit}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", fontWeight: "bold", background: "#ffffff" }}>{ri.quantity} {ri.item.unit}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{ri.note || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#ffffff", fontWeight: "bold" }}>
              <td colSpan={3} style={{ border: "1.5px solid #000", padding: "6px 8px", textAlign: "right", background: "#ffffff" }}>TOTAL REKAPITULASI:</td>
              <td style={{ border: "1.5px solid #000", padding: "6px 8px", textAlign: "right", background: "#ffffff" }}>{totalQuantity} Unit</td>
              <td style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>({totalItemsCount} Jenis Barang)</td>
            </tr>
          </tfoot>
        </table>

        {/* 3-Party Signatures Block - Digital Signature Stamps */}
        <div style={{ marginTop: "30px", pageBreakInside: "avoid" }}>
          <table style={{ width: "100%", border: "none", borderCollapse: "collapse", background: "#ffffff" }}>
            <tbody>
              <tr>
                <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 5px", background: "#ffffff" }}>
                  <DigitalSignatureStamp
                    title="Pemohon (Production Leader)"
                    signerName={request.requester.name}
                    signerRole="Production Leader"
                    timestamp={request.createdAt}
                    statusText="DIGITAL SIGNATURE VERIFIED"
                    requestId={request.id}
                    type="requester"
                  />
                </td>
                <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 5px", background: "#ffffff" }}>
                  <DigitalSignatureStamp
                    title="Penyetuju (Supervisor / PM)"
                    signerName={request.reviewer?.name}
                    signerRole={request.reviewer?.role ? (request.reviewer.role === "supervisor" ? "Supervisor" : "Plant Manager") : undefined}
                    timestamp={request.reviewedAt}
                    statusText="DIGITAL APPROVAL VERIFIED"
                    requestId={request.id}
                    type="reviewer"
                  />
                </td>
                <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 5px", background: "#ffffff" }}>
                  <DigitalSignatureStamp
                    title="Penyerah Barang (GA / Purchasing)"
                    signerName={request.handedOverByUser?.name}
                    signerRole={
                      request.handedOverByUser?.role === "ga"
                        ? "Tim GA"
                        : request.handedOverByUser?.role === "purchasing"
                        ? "Purchasing"
                        : request.handedOverByUser?.role
                    }
                    timestamp={request.handedOverAt}
                    statusText="DIGITAL HANDOVER VERIFIED"
                    requestId={request.id}
                    type="handover"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: "25px", borderTop: "1px solid #ddd", paddingTop: "6px", fontSize: "7.5pt", color: "#666", textAlign: "center" }}>
          Dokumen ini diproses dan dicetak secara otomatis dari Sistem Informasi Internal PT Unindo Ajidharma Industry. Sah sebagai bukti serah terima barang produksi.
        </div>
      </div>
    </div>
  );
}
