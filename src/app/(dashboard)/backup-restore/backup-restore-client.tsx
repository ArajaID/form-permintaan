"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDatabaseBackup, restoreDatabaseBackup } from "@/app/actions/backup-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BackupRestoreClient() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Membuat file backup database...");

    try {
      const res = await createDatabaseBackup();
      if (res.success && res.base64Data) {
        // Convert base64 to Blob & trigger download
        const byteCharacters = atob(res.base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/json" });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("File backup database berhasil diunduh!", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.message || "Gagal membuat backup database", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.name.endsWith(".json")) {
        toast.error("Format file harus ber-ekstensi .json");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setShowConfirmModal(false);
    const toastId = toast.loading("Memulihkan database dari file backup...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await restoreDatabaseBackup(formData);
      if (res.success) {
        toast.success(res.message, { id: toastId });
        setSelectedFile(null);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error?.message || "Gagal memulihkan database", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Backup & Restore Database
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Pengelolaan cadangan file JSON MariaDB untuk memulihkan atau menyimpan snapshot data sistem.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Akses Khusus: Halaman ini hanya dapat diakses oleh role <strong>Plant Manager</strong>.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2">
              <Download className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Backup Database
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Unduh cadangan data lengkap berupa file `.json` yang dapat disimpan secara offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <p className="font-medium text-slate-800">Catatan Backup:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Menghasilkan snapshot database MariaDB terkini secara aman.</li>
                <li>Format file: <code className="bg-slate-200 px-1 py-0.5 rounded">.json</code></li>
                <li>Dapat digunakan kapan saja untuk keperluan restore.</li>
              </ul>
            </div>

            <Button
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 py-5 rounded-xl shadow-md shadow-blue-600/20"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Backup...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh File Backup (.json)</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Restore Database
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Pulihkan database dari file cadangan <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono text-xs">.json</code> sebelumnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Penting:</span>
              </div>
              <p>
                Proses restore akan **menimpa seluruh data saat ini** dengan data dari file backup yang diunggah.
              </p>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Pilih File Backup (.json)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{selectedFile.name}</span>
                </div>
                <span className="text-emerald-600 shrink-0 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedFile || isImporting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium gap-2 py-5 rounded-xl shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memulihkan Database...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Jalankan Restore Database</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center text-lg">Konfirmasi Restore Database</DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-600">
              Apakah Anda yakin ingin menimpa database saat ini dengan file: <br />
              <strong className="text-slate-900 font-mono text-xs">{selectedFile?.name}</strong>?
              <br />
              <span className="text-amber-700 text-xs mt-2 block font-semibold">
                Perhatian: Tindakan ini tidak dapat dibatalkan.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="w-full sm:w-auto rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={handleExecuteRestore}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
            >
              Ya, Mulai Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
