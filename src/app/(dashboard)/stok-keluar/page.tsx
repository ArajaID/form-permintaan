"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getItems,
  addStockOut,
  getStockMovements,
} from "@/app/actions/stock-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ArrowUpFromLine,
  Minus,
  Loader2,
  Package,
  Calendar,
  Printer,
  History,
} from "lucide-react";
import { toast } from "sonner";

type Item = Awaited<ReturnType<typeof getItems>>[number];
type Movement = Awaited<ReturnType<typeof getStockMovements>>[number];

export default function StokKeluarPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, movementsData] = await Promise.all([
        getItems("", false),
        getStockMovements("keluar"),
      ]);
      setItems(itemsData);
      setMovements(movementsData);
      if (itemsData.length > 0) {
        setSelectedItemId(String(itemsData[0].id));
      }
    } catch (error) {
      toast.error("Gagal memuat data stok keluar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      toast.error("Pilih barang terlebih dahulu");
      return;
    }

    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 1) {
      toast.error("Jumlah stok keluar minimal 1");
      return;
    }

    const item = items.find((i) => String(i.id) === selectedItemId);
    if (item && qtyNum > item.stock) {
      toast.error(`Stok tidak mencukupi. Stok saat ini: ${item.stock}`);
      return;
    }

    startTransition(async () => {
      try {
        await addStockOut(parseInt(selectedItemId), qtyNum, undefined, note || undefined);
        toast.success("Stok keluar berhasil dicatat!");
        setQuantity("1");
        setNote("");
        loadData();
      } catch (error: any) {
        toast.error(error.message || "Gagal mencatat stok keluar");
      }
    });
  };

  const selectedItem = items.find((i) => String(i.id) === selectedItemId);
  const totalQuantityOut = movements.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Screen View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catat Stok Keluar</h1>
          <p className="text-slate-500 mt-1">
            Pencatatan barang produksi yang dikeluarkan dari gudang
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="no-print self-start sm:self-auto border-slate-300"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Laporan (PDF)
        </Button>
      </div>

      {/* Input Form Card */}
      <Card className="border-0 shadow-lg no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2.5 text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <Minus className="w-4.5 h-4.5" />
            </div>
            Catat Pengeluaran Barang Keluar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="item-select-out" className="text-slate-700 font-medium">
                  Pilih Barang
                </Label>
                <Select
                  value={selectedItemId}
                  onValueChange={(val) => setSelectedItemId(val || "")}
                >
                  <SelectTrigger id="item-select-out" className="mt-1 w-full">
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
                          (Stok: {item.stock} {item.unit})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedItem && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    Stok tersedia saat ini: {selectedItem.stock} {selectedItem.unit}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="qty-input-out" className="text-slate-700 font-medium">
                  Jumlah Barang Keluar
                </Label>
                <Input
                  id="qty-input-out"
                  type="number"
                  min={1}
                  max={selectedItem?.stock || undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(quantity);
                    if (isNaN(parsed) || parsed < 1) setQuantity("1");
                  }}
                  placeholder="Masukkan jumlah..."
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="note-input-out" className="text-slate-700 font-medium">
                  Catatan / Keterangan (Opsional)
                </Label>
                <Input
                  id="note-input-out"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Diambil untuk Shift A..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending || !selectedItemId}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold shadow-md shadow-red-600/20 px-6"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine className="w-4 h-4 mr-2" />
                    Simpan Stok Keluar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History Subheader */}
      <div className="flex items-center justify-between pt-2 no-print">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Riwayat Transaksi Stok Keluar
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto">
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
            Total Transaksi: {movements.length}
          </span>
          <span className="bg-red-50 text-red-800 px-3 py-1.5 rounded-full border border-red-200 font-semibold">
            Total Keluar: -{totalQuantityOut} Unit
          </span>
        </div>
      </div>

      {/* History Table Screen Card */}
      <Card className="border-0 shadow-lg no-print">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-16">
              <ArrowUpFromLine className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-slate-800">
                Belum ada catatan stok keluar
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Gunakan form di atas untuk mencatat pengeluaran barang.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead className="text-right">Jumlah Keluar</TableHead>
                    <TableHead>Petugas Pencatat</TableHead>
                    <TableHead>Tanggal Transaksi</TableHead>
                    <TableHead>Catatan / Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mov, index) => {
                    const userInitials = mov.createdByUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-muted-foreground text-xs text-center font-mono font-bold">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                              <Package className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-slate-900">
                              {mov.item.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100 text-xs font-bold px-2.5 py-0.5">
                            -{mov.quantity} {mov.item.unit}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-800">
                              {mov.createdByUser.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(mov.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {mov.note || <span className="text-slate-400 italic">-</span>}
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

      {/* Formal Paper Document Print Layout for Stock Out */}
      <div className="print-only" style={{ fontFamily: "Arial, sans-serif", width: "100%", margin: "0", padding: "0" }}>
        {/* Kop Surat Perusahaan */}
        <div style={{ borderBottom: "3px double #000", paddingBottom: "10px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0", letterSpacing: "0.5px", color: "#000" }}>
                PT UNINDO AJIDHARMA INDUSTRY
              </h1>
              <p style={{ fontSize: "8.5pt", color: "#555", margin: "2px 0 0 0" }}>
                Divisi Pergudangan & Pengeluaran Barang Produksi
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0", textTransform: "uppercase", textDecoration: "underline" }}>
                LAPORAN PENGELUARAN BARANG KELUAR
              </h2>
              <p style={{ fontSize: "8pt", color: "#444", margin: "4px 0 0 0" }}>
                Tgl Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>
        </div>

        {/* Goods Out Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginBottom: "25px", background: "#ffffff" }}>
          <thead>
            <tr style={{ background: "#ffffff" }}>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "35px", textAlign: "center", background: "#ffffff" }}>NO</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", textAlign: "left", background: "#ffffff" }}>NAMA BARANG PRODUKSI</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "100px", textAlign: "right", background: "#ffffff" }}>JUMLAH KELUAR</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "70px", textAlign: "center", background: "#ffffff" }}>SATUAN</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "130px", textAlign: "left", background: "#ffffff" }}>PETUGAS PENCATAT</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", width: "130px", textAlign: "left", background: "#ffffff" }}>TANGGAL & WAKTU</th>
              <th style={{ border: "1.5px solid #000", padding: "6px", textAlign: "left", background: "#ffffff" }}>CATATAN / SHIFT PRODUKSI</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((mov, idx) => (
              <tr key={mov.id} style={{ background: "#ffffff" }}>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>{idx + 1}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", fontWeight: "bold", background: "#ffffff" }}>{mov.item.name}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "right", fontWeight: "bold", background: "#ffffff" }}>-{mov.quantity}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", textAlign: "center", background: "#ffffff" }}>{mov.item.unit}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{mov.createdByUser.name}</td>
                <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>
                  {new Date(mov.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ border: "1.5px solid #000", padding: "6px", background: "#ffffff" }}>{mov.note || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#ffffff", fontWeight: "bold" }}>
              <td colSpan={2} style={{ border: "1.5px solid #000", padding: "6px 8px", textAlign: "right", background: "#ffffff" }}>TOTAL PENGELUARAN:</td>
              <td style={{ border: "1.5px solid #000", padding: "6px 8px", textAlign: "right", background: "#ffffff" }}>-{totalQuantityOut}</td>
              <td colSpan={4} style={{ border: "1.5px solid #000", padding: "6px 8px", background: "#ffffff" }}>({movements.length} Transaksi Pengeluaran)</td>
            </tr>
          </tfoot>
        </table>

        {/* 3-Party Signatures Block - Perfectly Aligned */}
        <div style={{ marginTop: "40px", pageBreakInside: "avoid" }}>
          <table style={{ width: "100%", border: "none", borderCollapse: "collapse", background: "#ffffff" }}>
            <tbody>
              <tr>
                <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 10px", background: "#ffffff" }}>
                  <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 60px 0" }}>Petugas Pengeluar Gudang</p>
                  <p style={{ fontSize: "9pt", borderBottom: "1px solid #000", paddingBottom: "2px", fontWeight: "bold", margin: "0", display: "inline-block", minWidth: "160px" }}>
                    (...........................)
                  </p>
                </td>
                <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 10px", background: "#ffffff" }}>
                  <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 60px 0" }}>Supervisor Gudang</p>
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
    </div>
  );
}
