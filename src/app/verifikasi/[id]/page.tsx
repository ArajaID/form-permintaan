import { getRequestById } from "@/app/actions/request-actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Calendar,
  Boxes,
  Building2,
  FileCheck2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { decodeRequestId } from "@/lib/hash-id";

const statusConfig = {
  menunggu: {
    label: "MENUNGGU PERSETUJUAN",
    icon: Clock,
    className: "bg-amber-100 text-amber-900 border-amber-300",
  },
  disetujui: {
    label: "DISETUJUI & TERVERIFIKASI SAH",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  diserahkan: {
    label: "BARANG DISERAHKAN & TERVERIFIKASI SAH",
    icon: CheckCircle2,
    className: "bg-teal-100 text-teal-900 border-teal-300",
  },
  ditolak: {
    label: "PERMINTAAN DITOLAK",
    icon: XCircle,
    className: "bg-red-100 text-red-900 border-red-300",
  },
};

export default async function VerifikasiDokumenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requestId = decodeRequestId(id);

  if (!requestId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-red-200 shadow-xl">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Kode Hash Tidak Valid</h1>
            <p className="text-sm text-slate-500">
              Kode enkripsi verifikasi tanda tangan digital tidak dikenali atau telah diubah secara tidak sah.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const request = await getRequestById(requestId);

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-red-200 shadow-xl">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Dokumen Tidak Ditemukan</h1>
            <p className="text-sm text-slate-500">
              Nomor registrasi dokumen permintaan <span className="font-mono font-bold">NGR-REQ-#{id}</span> tidak terdaftar dalam database sistem PT Unindo Ajidharma Industry.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config =
    statusConfig[request.status as keyof typeof statusConfig] ||
    statusConfig.menunggu;

  const totalQuantity = request.requestItems.reduce(
    (sum: number, ri: any) => sum + ri.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100/80 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Company Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
            <Building2 className="w-4 h-4 text-emerald-400" />
            PT UNINDO AJIDHARMA INDUSTRY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verifikasi Keabsahan Tanda Tangan Digital
          </h1>
          <p className="text-sm text-slate-500">
            Halaman Resmi Pengujian Dokumen Permintaan Barang Produksi
          </p>
        </div>

        {/* Verification Status Banner */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                  Nomor Registrasi Dokumen
                </p>
                <h2 className="text-xl sm:text-2xl font-mono font-extrabold">
                  NGR-REQ-#{request.id}
                </h2>
              </div>
            </div>
            <Badge className={`${config.className} px-4 py-2 text-xs font-bold shadow-sm`}>
              <config.icon className="w-4 h-4 mr-1.5" />
              {config.label}
            </Badge>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* General Purpose */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Keperluan Pengajuan Produksi:
              </span>
              <p className="text-base font-semibold text-slate-900">
                {request.purpose || "-"}
              </p>
            </div>

            {/* Signatures & Timestamps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Requester Signature */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    1. Pemohon (Leader)
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {request.requester.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{request.requester.name}</p>
                    <p className="text-xs text-slate-500 font-mono font-medium">NIK: {request.requester.nik || request.requester.username || request.requester.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Waktu TTD: {new Date(request.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </div>
              </div>

              {/* Reviewer Signature */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    2. Penyetuju (Supervisor/PM)
                  </span>
                  {request.status === "disetujui" || request.status === "diserahkan" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                {request.reviewer ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {request.reviewer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{request.reviewer.name}</p>
                        <p className="text-xs text-slate-500 font-mono font-medium">
                          {request.reviewer.role === "supervisor" ? "Supervisor" : "Plant Manager"} (NIK: {request.reviewer.nik || request.reviewer.username || request.reviewer.email})
                        </p>
                      </div>
                    </div>
                    {request.reviewedAt && (
                      <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Waktu Persetujuan: {new Date(request.reviewedAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-slate-500 italic py-3">
                    Belum disetujui oleh atasan.
                  </div>
                )}
              </div>

              {/* Handover Signature */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    3. Penyerah Barang
                  </span>
                  {request.status === "diserahkan" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                {request.handedOverByUser ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {request.handedOverByUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{request.handedOverByUser.name}</p>
                        <p className="text-xs text-slate-500 font-mono font-medium">
                          {request.handedOverByUser.role === "ga" ? "Tim GA" : request.handedOverByUser.role === "purchasing" ? "Purchasing" : request.handedOverByUser.role} (NIK: {request.handedOverByUser.nik || request.handedOverByUser.username || request.handedOverByUser.email})
                        </p>
                      </div>
                    </div>
                    {request.handedOverAt && (
                      <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Waktu Penyerahan: {new Date(request.handedOverAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-slate-500 italic py-3">
                    Belum diserahkan oleh penyerah barang.
                  </div>
                )}
              </div>
            </div>

            {/* Requested Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  Rincian Barang Produksi Terdaftar
                </h3>
                <Badge variant="outline" className="text-xs font-semibold text-slate-700 bg-slate-50">
                  Total: {totalQuantity} Unit
                </Badge>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                      <TableHead className="text-xs font-bold">Nama Barang</TableHead>
                      <TableHead className="text-xs font-bold text-center">Satuan</TableHead>
                      <TableHead className="text-xs font-bold text-right">Jumlah Diminta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {request.requestItems.map((ri: any, idx: number) => (
                      <TableRow key={ri.id}>
                        <TableCell className="text-center font-mono text-xs text-slate-500 font-bold">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900 text-sm">{ri.item.name}</TableCell>
                        <TableCell className="text-center text-xs font-medium text-slate-600">{ri.item.unit}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-700 text-sm">{ri.quantity} {ri.item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Authenticity Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">
                Sistem Verifikasi Otomatis — PT UNINDO AJIDHARMA INDUSTRY
              </p>
              <p>
                Informasi pada halaman ini dicocokkan secara real-time dari database produksi internal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
