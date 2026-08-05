"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getItems } from "@/app/actions/stock-actions";
import { createRequest } from "@/app/actions/request-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Send,
  Loader2,
  Search,
  Package,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

type Item = {
  id: number;
  name: string;
  unit: string;
  stock: number;
};

type RequestItem = {
  itemId: number;
  itemName: string;
  unit: string;
  stock: number;
  quantity: number | string;
  note: string;
};

export default function BuatPermintaanPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedItems, setSelectedItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getItems("", false);
      setItems(data);
    } catch (error) {
      toast.error("Gagal memuat daftar barang");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedItems.some((si) => si.itemId === item.id)
  );

  const addItem = (item: Item) => {
    setSelectedItems([
      ...selectedItems,
      {
        itemId: item.id,
        itemName: item.name,
        unit: item.unit,
        stock: item.stock,
        quantity: 1,
        note: "",
      },
    ]);
    setSearch("");
  };

  const removeItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter((si) => si.itemId !== itemId));
  };

  const updateQuantity = (itemId: number, val: string) => {
    setSelectedItems(
      selectedItems.map((si) =>
        si.itemId === itemId ? { ...si, quantity: val } : si
      )
    );
  };

  const handleQuantityBlur = (itemId: number) => {
    setSelectedItems(
      selectedItems.map((si) => {
        if (si.itemId !== itemId) return si;
        const parsed = parseInt(String(si.quantity));
        return {
          ...si,
          quantity: isNaN(parsed) || parsed < 1 ? 1 : parsed,
        };
      })
    );
  };

  const updateNote = (itemId: number, note: string) => {
    setSelectedItems(
      selectedItems.map((si) =>
        si.itemId === itemId ? { ...si, note } : si
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Pilih minimal satu barang");
      return;
    }

    if (!purpose.trim()) {
      toast.error("Isi keperluan permintaan");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createRequest(
          selectedItems.map((si) => ({
            itemId: si.itemId,
            quantity: Math.max(1, parseInt(String(si.quantity)) || 1),
            note: si.note || undefined,
          })),
          purpose
        );

        toast.success("Permintaan berhasil dikirim!");
        router.push(`/riwayat-permintaan/${result.requestId}`);
      } catch (error: any) {
        toast.error(error.message || "Gagal mengirim permintaan");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Buat Permintaan</h1>
        <p className="text-slate-500 mt-1">
          Pilih barang yang dibutuhkan dan kirim permintaan ke atasan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purpose */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Keperluan</CardTitle>
            <CardDescription>
              Jelaskan keperluan permintaan barang ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Contoh: Kebutuhan produksi line A minggu ini..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </CardContent>
        </Card>

        {/* Item Selection */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Pilih Barang</CardTitle>
            <CardDescription>
              Cari dan pilih barang yang dibutuhkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {search && (
              <div className="border rounded-xl max-h-60 overflow-y-auto divide-y shadow-sm">
                {filteredItems.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    Barang tidak ditemukan
                  </p>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.stock > 5 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          Stok: {item.stock}
                        </Badge>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium">
                    Barang Dipilih ({selectedItems.length})
                  </p>
                </div>
                {selectedItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          Stok tersedia: {item.stock} {item.unit}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.itemId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Jumlah ({item.unit})</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.itemId, e.target.value)
                          }
                          onBlur={() => handleQuantityBlur(item.itemId)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Catatan (opsional)</Label>
                        <Input
                          placeholder="Catatan tambahan..."
                          value={item.note}
                          onChange={(e) =>
                            updateNote(item.itemId, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItems.length === 0 && !search && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada barang yang dipilih</p>
                <p className="text-xs mt-1">
                  Gunakan kolom pencarian di atas untuk menambah barang
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || selectedItems.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-8 shadow-lg shadow-blue-500/25 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Permintaan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
