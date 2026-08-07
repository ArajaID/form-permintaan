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
  PackageCheck,
} from "lucide-react";
import Link from "next/link";
import { PrintButton } from "./print-button";
import { OfficialRequestPrintForm } from "@/components/official-request-print-form";

function formatFullDateTime(date?: Date | string | null) {
  if (!date) return "-";
  const d = new Date(date);
  return (
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB"
  );
}

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

  const handoverInitials = request.handedOverByUser
    ? request.handedOverByUser.name
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pemohon Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Informasi Pemohon
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-h-[64px]">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                      {requesterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">{request.requester.name}</p>
                    <p className="text-xs text-slate-500 truncate">{request.requester.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Waktu Pengajuan
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[46px]">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{formatFullDateTime(request.createdAt)}</span>
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
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-h-[64px]">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                        {reviewerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 truncate">{request.reviewer.name}</p>
                      <p className="text-xs text-slate-500 truncate">{request.reviewer.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800 text-xs min-h-[64px] flex items-center">
                    Permintaan ini sedang menunggu pemeriksaan dari Supervisor atau Plant Manager.
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Waktu Keputusan
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[46px]">
                  {request.reviewedAt ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{formatFullDateTime(request.reviewedAt)}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-slate-500 italic font-normal">Belum ada keputusan</span>
                    </>
                  )}
                </div>
              </div>

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

            {/* Penyerah Barang Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Informasi Penyerahan Barang
                </p>
                {request.handedOverByUser ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-h-[64px]">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-sm">
                        {handoverInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 truncate">{request.handedOverByUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{request.handedOverByUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-xs italic min-h-[64px] flex items-center">
                    Belum diserahkan oleh penyerah barang.
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Waktu Penyerahan
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[46px]">
                  {request.handedOverAt ? (
                    <>
                      <PackageCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>{formatFullDateTime(request.handedOverAt)}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 italic font-normal">Belum diserahkan</span>
                    </>
                  )}
                </div>
              </div>
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
      <div className="print-only">
        <OfficialRequestPrintForm request={request} />
      </div>
    </div>
  );
}
