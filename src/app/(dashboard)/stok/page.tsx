"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getItems,
  createItem,
  updateItem,
  toggleItemStatus,
} from "@/app/actions/stock-actions";
import { authClient } from "@/lib/auth-client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Package,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PackageX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type ItemData = Awaited<ReturnType<typeof getItems>>[number];

export default function StokPage() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as any)?.role || "leader";
  const canManage = role === "supervisor" || role === "plant_manager";

  const [items, setItems] = useState<ItemData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Modal
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  // Edit Modal
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: ItemData | null;
  }>({ open: false, item: null });
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Toggle Status Modal
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean;
    item: ItemData | null;
  }>({ open: false, item: null });

  useEffect(() => {
    loadItems();
  }, [search, canManage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const loadItems = async () => {
    try {
      const data = await getItems(search || undefined, true);
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat daftar stok barang");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUnit.trim()) {
      toast.error("Nama barang dan satuan wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        await createItem(newName, newUnit);
        toast.success(`Barang ${newName} berhasil ditambahkan!`);
        setCreateDialogOpen(false);
        setNewName("");
        setNewUnit("");
        loadItems();
      } catch (error: any) {
        toast.error(error.message || "Gagal menambah barang");
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.item) return;
    if (!editName.trim() || !editUnit.trim()) {
      toast.error("Nama barang dan satuan wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        await updateItem(editDialog.item!.id, editName, editUnit);
        toast.success("Data barang berhasil diperbarui");
        setEditDialog({ open: false, item: null });
        loadItems();
      } catch (error: any) {
        toast.error(error.message || "Gagal mengedit barang");
      }
    });
  };

  const handleToggleStatus = () => {
    if (!toggleDialog.item) return;
    const item = toggleDialog.item;

    startTransition(async () => {
      try {
        const res = await toggleItemStatus(item.id);
        toast.success(
          res.isActive
            ? `Barang ${item.name} berhasil diaktifkan kembali`
            : `Barang ${item.name} berhasil dinonaktifkan`
        );
        setToggleDialog({ open: false, item: null });
        loadItems();
      } catch (error: any) {
        toast.error(error.message || "Gagal mengubah status barang");
      }
    });
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === "tersedia") return item.isActive && item.stock > 5;
    if (statusFilter === "rendah") return item.isActive && item.stock > 0 && item.stock <= 5;
    if (statusFilter === "habis") return item.isActive && item.stock === 0;
    if (statusFilter === "nonaktif") return !item.isActive;
    return true;
  });

  // Pagination Calculations
  const totalItemsCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItemsCount);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const getStockBadge = (item: ItemData) => {
    if (!item.isActive) {
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
          <XCircle className="w-3 h-3 mr-1 text-slate-400" />
          Nonaktif
        </Badge>
      );
    }
    if (item.stock === 0) {
      return (
        <Badge variant="destructive">
          <PackageX className="w-3 h-3 mr-1" />
          Habis
        </Badge>
      );
    }
    if (item.stock <= 5) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
          Stok Rendah
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
        Tersedia
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Barang</h1>
          <p className="text-slate-500 mt-1">
            Master barang & pantauan stok kebutuhan produksi
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Barang Baru
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "semua")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="tersedia">Stok Tersedia (&gt;5)</SelectItem>
            <SelectItem value="rendah">Stok Rendah (1-5)</SelectItem>
            <SelectItem value="habis">Stok Habis (0)</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Table Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-slate-800">Tidak ada barang</h3>
              <p className="text-sm text-slate-500 mt-1">
                Belum ada data barang yang sesuai dengan pencarian/filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-14 text-center font-bold">No</TableHead>
                    <TableHead className="font-bold">Nama Barang</TableHead>
                    <TableHead className="font-bold">Satuan</TableHead>
                    <TableHead className="text-right font-bold">Jumlah Stok</TableHead>
                    <TableHead className="font-bold">Status Stok</TableHead>
                    {canManage && <TableHead className="text-right font-bold">Aksi Master</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !item.isActive ? "opacity-60 bg-slate-50/50" : ""
                      }`}
                    >
                      <TableCell className="text-muted-foreground text-sm text-center font-mono font-bold">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              !item.isActive
                                ? "bg-slate-200 text-slate-500"
                                : item.stock === 0
                                ? "bg-red-100 text-red-600"
                                : item.stock <= 5
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">
                        {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold text-base ${
                            item.stock === 0
                              ? "text-red-600"
                              : item.stock <= 5
                              ? "text-amber-600"
                              : "text-slate-900"
                          }`}
                        >
                          {item.stock}
                        </span>{" "}
                        <span className="text-xs text-slate-500 font-normal">
                          {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>{getStockBadge(item)}</TableCell>

                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditDialog({ open: true, item });
                                setEditName(item.name);
                                setEditUnit(item.unit);
                              }}
                              className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant={item.isActive ? "outline" : "default"}
                              size="sm"
                              onClick={() => setToggleDialog({ open: true, item })}
                              className={`h-8 px-2.5 text-xs ${
                                item.isActive
                                  ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {item.isActive ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls Footer */}
          {filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  Menampilkan <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> dari <strong>{totalItemsCount}</strong> barang
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-slate-400">| Per Halaman:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val) || 10);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 px-2.5 text-xs border-slate-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {safePage} / {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-8 px-2.5 text-xs border-slate-300"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah Barang */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Tambah Barang Baru
            </DialogTitle>
            <DialogDescription>
              Masukkan nama barang produksi baru dan satuannya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nama Barang</Label>
              <Input
                id="create-name"
                placeholder="Contoh: Sarung Tangan Latex Extra"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-unit">Satuan (Unit)</Label>
              <Input
                id="create-unit"
                placeholder="Contoh: pcs, box, roll, pasang, lusin, kg"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Barang"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Barang */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, item: open ? editDialog.item : null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              Edit Data Barang
            </DialogTitle>
            <DialogDescription>
              Ubah informasi nama barang atau satuan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Barang</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit">Satuan</Label>
              <Input
                id="edit-unit"
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog({ open: false, item: null })}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Toggle Status Nonaktif/Aktif */}
      <Dialog
        open={toggleDialog.open}
        onOpenChange={(open) =>
          setToggleDialog({ open, item: open ? toggleDialog.item : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {toggleDialog.item?.isActive
                ? "Nonaktifkan Barang"
                : "Aktifkan Barang"}
            </DialogTitle>
            <DialogDescription>
              {toggleDialog.item?.isActive
                ? `Barang "${toggleDialog.item?.name}" tidak akan dapat dipilih pada form pembuatan permintaan barang baru.`
                : `Aktifkan kembali barang "${toggleDialog.item?.name}" agar dapat dipilih kembali.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToggleDialog({ open: false, item: null })}
            >
              Batal
            </Button>
            <Button
              variant={toggleDialog.item?.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={isPending}
              className={
                toggleDialog.item?.isActive ? "" : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : toggleDialog.item?.isActive ? (
                "Nonaktifkan"
              ) : (
                "Aktifkan Kembali"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
