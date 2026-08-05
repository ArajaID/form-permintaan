"use client";

import { useState, useEffect } from "react";
import { getItems, getItemStockCard } from "@/app/actions/stock-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Printer,
  Search,
  Loader2,
  Calendar,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

type Item = Awaited<ReturnType<typeof getItems>>[number];
type StockCardData = Awaited<ReturnType<typeof getItemStockCard>>;

export default function KartuStokPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [stockCard, setStockCard] = useState<StockCardData | null>(null);

  useEffect(() => {
    loadItemsList();
  }, []);

  const loadItemsList = async () => {
    try {
      const data = await getItems("", true);
      setItems(data);
      if (data.length > 0) {
        setSelectedItemId(String(data[0].id));
      }
    } catch (error) {
      toast.error("Gagal memuat daftar barang");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (selectedItemId) {
      loadCardData();
    }
  }, [selectedItemId, startDate, endDate]);

  const loadCardData = async () => {
    if (!selectedItemId) return;
    setLoadingCard(true);
    try {
      const data = await getItemStockCard(
        parseInt(selectedItemId),
        startDate || undefined,
        endDate || undefined
      );
      setStockCard(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat kartu stok");
    } finally {
      setLoadingCard(false);
    }
  };

  const selectedItem = items.find((i) => String(i.id) === selectedItemId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kartu Stok Barang</h1>
          <p className="text-slate-500 mt-1">
            Buku mutasi persediaan barang produksi per tanggal dan periode
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          disabled={!stockCard}
          className="no-print self-start sm:self-auto border-slate-300 shadow-xs"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Kartu Stok (PDF)
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border-0 shadow-lg no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Filter Barang & Periode Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-700 font-medium">Pilih Barang</Label>
              <Select
                value={selectedItemId}
                onValueChange={(val) => setSelectedItemId(val || "")}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="-- Pilih Barang --">
                    {selectedItem
                      ? `${selectedItem.name} (${selectedItem.unit})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-muted-foreground text-xs">
                        ({item.unit})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-700 font-medium">Tanggal Mulai</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-700 font-medium">Tanggal Selesai</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Summary Statistics Cards */}
      {stockCard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Saldo Awal Periode</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stockCard.openingBalance} <span className="text-xs font-normal text-slate-500">{stockCard.item.unit}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Total Barang Masuk (+)</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  +{stockCard.totalIn} <span className="text-xs font-normal text-slate-500">{stockCard.item.unit}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Total Barang Keluar (-)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  -{stockCard.totalOut} <span className="text-xs font-normal text-slate-500">{stockCard.item.unit}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-100 font-medium">Saldo Akhir Stok</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stockCard.closingBalance} <span className="text-xs font-normal text-blue-200">{stockCard.item.unit}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Ledger Table Screen View */}
      <Card className="border-0 shadow-lg no-print">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Rincian Mutasi Kartu Stok ({selectedItem?.name || "-"})
            </CardTitle>
            <Badge variant="outline" className="text-xs font-semibold">
              Satuan: {selectedItem?.unit || "-"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingCard ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !stockCard || stockCard.ledger.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-slate-800">
                Belum ada transaksi mutasi
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Tidak ada catatan mutasi stok pada barang dan periode tanggal ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-12 text-center font-bold">No</TableHead>
                    <TableHead className="font-bold">Tanggal & Waktu</TableHead>
                    <TableHead className="font-bold">Keterangan / Ref</TableHead>
                    <TableHead className="font-bold">Petugas</TableHead>
                    <TableHead className="text-right font-bold text-emerald-700">Masuk (+)</TableHead>
                    <TableHead className="text-right font-bold text-red-700">Keluar (-)</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">Saldo Akhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Saldo Awal Row */}
                  <TableRow className="bg-slate-50 font-medium">
                    <TableCell className="text-center text-xs text-slate-400 font-mono">-</TableCell>
                    <TableCell className="text-xs text-slate-500 italic">
                      {startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Awal"}
                    </TableCell>
                    <TableCell colSpan={2} className="text-xs font-semibold text-slate-700">
                      SALDO AWAL PERIODE
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-400">-</TableCell>
                    <TableCell className="text-right text-xs text-slate-400">-</TableCell>
                    <TableCell className="text-right font-bold text-sm text-slate-900">
                      {stockCard.openingBalance} {stockCard.item.unit}
                    </TableCell>
                  </TableRow>

                  {/* Ledger Rows */}
                  {stockCard.ledger.map((row, index) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono font-bold text-slate-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(row.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-800">
                        {row.note}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {row.user}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.type === "masuk" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-xs font-bold">
                            +{row.quantity}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.type === "keluar" ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 text-xs font-bold">
                            -{row.quantity}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-blue-900">
                        {row.balance} {stockCard.item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formal Paper Document Print Layout for Stock Card */}
      {stockCard && (
        <div className="print-only" style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Formal Kop Surat Header */}
          <div style={{ borderBottom: "3px double #000", paddingBottom: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0", letterSpacing: "0.5px" }}>
                  PT UNINDO AJIDHARMA INDUSTRY
                </h1>
                <p style={{ fontSize: "8.5pt", color: "#555", margin: "2px 0 0 0" }}>
                  Laporan Pengelolaan Persediaan & Kartu Stok Barang Produksi
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0", textTransform: "uppercase" }}>
                  KARTU STOK BARANG
                </h2>
                <p style={{ fontSize: "8pt", color: "#444", margin: "4px 0 0 0" }}>
                  Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Item Info Header Box */}
          <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse", fontSize: "9pt", border: "1.5px solid #000", background: "#ffffff" }}>
            <tbody>
              <tr>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", width: "18%", fontWeight: "bold", background: "#ffffff" }}>Nama Barang</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", width: "32%", fontWeight: "bold", background: "#ffffff" }}>{stockCard.item.name}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", width: "18%", fontWeight: "bold", background: "#ffffff" }}>Satuan (Unit)</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", width: "32%", background: "#ffffff" }}>{stockCard.item.unit}</td>
              </tr>
              <tr>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", fontWeight: "bold", background: "#ffffff" }}>Periode Tanggal</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", background: "#ffffff" }}>
                  {startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Semua Tanggal"} s/d {endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Hari Ini"}
                </td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", fontWeight: "bold", background: "#ffffff" }}>Status Keaktifan</td>
                <td style={{ border: "1.5px solid #000", padding: "6px 10px", background: "#ffffff" }}>{stockCard.item.isActive ? "AKTIF" : "NONAKTIF"}</td>
              </tr>
            </tbody>
          </table>

          {/* Ledger Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginBottom: "25px", background: "#ffffff" }}>
            <thead>
              <tr style={{ background: "#ffffff" }}>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "35px", textAlign: "center", background: "#ffffff" }}>NO</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "130px", textAlign: "left", background: "#ffffff" }}>TANGGAL & WAKTU</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", textAlign: "left", background: "#ffffff" }}>KETERANGAN / DOKUMEN</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "100px", textAlign: "left", background: "#ffffff" }}>PETUGAS</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "70px", textAlign: "right", background: "#ffffff" }}>MASUK (+)</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "70px", textAlign: "right", background: "#ffffff" }}>KELUAR (-)</th>
                <th style={{ border: "1.5px solid #000", padding: "6px", width: "90px", textAlign: "right", background: "#ffffff" }}>SALDO STOK</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening Balance */}
              <tr style={{ background: "#ffffff", fontWeight: "bold" }}>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>-</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{startDate || "Awal"}</td>
                <td colSpan={2} style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>SALDO AWAL PERIODE</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", background: "#ffffff" }}>-</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", background: "#ffffff" }}>-</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", background: "#ffffff" }}>{stockCard.openingBalance} {stockCard.item.unit}</td>
              </tr>

              {stockCard.ledger.map((row, idx) => (
                <tr key={row.id} style={{ background: "#ffffff" }}>
                  <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>{idx + 1}</td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>
                    {new Date(row.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{row.note}</td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{row.user}</td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", fontWeight: row.type === "masuk" ? "bold" : "normal", background: "#ffffff" }}>
                    {row.type === "masuk" ? `+${row.quantity}` : "-"}
                  </td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", fontWeight: row.type === "keluar" ? "bold" : "normal", background: "#ffffff" }}>
                    {row.type === "keluar" ? `-${row.quantity}` : "-"}
                  </td>
                  <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", fontWeight: "bold", background: "#ffffff" }}>
                    {row.balance} {stockCard.item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#ffffff", fontWeight: "bold" }}>
                <td colSpan={4} style={{ border: "1.5px solid #000", padding: "6px 10px", textAlign: "right", background: "#ffffff" }}>REKAPITULASI PERIODE:</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", color: "green", background: "#ffffff" }}>+{stockCard.totalIn}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", color: "red", background: "#ffffff" }}>-{stockCard.totalOut}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", background: "#ffffff" }}>{stockCard.closingBalance} {stockCard.item.unit}</td>
              </tr>
            </tfoot>
          </table>

          {/* Signature Block - Perfectly Aligned */}
          <div style={{ marginTop: "40px", pageBreakInside: "avoid" }}>
            <table style={{ width: "100%", border: "none", borderCollapse: "collapse", background: "#ffffff" }}>
              <tbody>
                <tr>
                  <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 10px", background: "#ffffff" }}>
                    <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 60px 0" }}>Petugas Gudang</p>
                    <p style={{ fontSize: "9pt", borderBottom: "1px solid #000", paddingBottom: "2px", fontWeight: "bold", margin: "0", display: "inline-block", minWidth: "160px" }}>
                      (...........................)
                    </p>
                  </td>
                  <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 10px", background: "#ffffff" }}>
                    <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 60px 0" }}>Supervisor</p>
                    <p style={{ fontSize: "9pt", borderBottom: "1px solid #000", paddingBottom: "2px", fontWeight: "bold", margin: "0", display: "inline-block", minWidth: "160px" }}>
                      (...........................)
                    </p>
                  </td>
                  <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 10px", background: "#ffffff" }}>
                    <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 60px 0" }}>Plant Manager</p>
                    <p style={{ fontSize: "9pt", borderBottom: "1px solid #000", paddingBottom: "2px", fontWeight: "bold", margin: "0", display: "inline-block", minWidth: "160px" }}>
                      (...........................)
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
