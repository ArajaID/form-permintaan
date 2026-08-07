"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  toggleEmployeeStatus,
} from "@/app/actions/user-actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  UserPlus,
  Search,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

type EmployeeData = Awaited<ReturnType<typeof getEmployees>>[number];

const roleLabels: Record<string, string> = {
  leader: "Production Leader",
  supervisor: "Supervisor Produksi",
  plant_manager: "Plant Manager",
  ga: "Tim General Affair (GA)",
  purchasing: "Tim Purchasing",
};

const roleBadgeStyles: Record<string, string> = {
  leader: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  plant_manager: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ga: "bg-emerald-50 text-emerald-700 border-emerald-200",
  purchasing: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Add Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"leader" | "supervisor" | "plant_manager" | "ga" | "purchasing">("leader");
  const [showPassword, setShowPassword] = useState(false);

  // Edit Dialog State
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    employee: EmployeeData | null;
  }>({ open: false, employee: null });
  const [editName, setEditName] = useState("");
  const [editNik, setEditNik] = useState("");
  const [editRole, setEditRole] = useState<"leader" | "supervisor" | "plant_manager" | "ga" | "purchasing">("leader");

  // Toggle Confirm Dialog State
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean;
    employee: EmployeeData | null;
  }>({ open: false, employee: null });

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees(search || undefined);
      setEmployees(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nik.trim()) {
      toast.error("Nama dan NIK Karyawan wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        await addEmployee({ name, nik, password, role });
        toast.success(`Karyawan ${name} (NIK: ${nik}) berhasil ditambahkan!`);
        setAddDialogOpen(false);
        setName("");
        setNik("");
        setPassword("");
        setRole("leader");
        loadEmployees();
      } catch (error: any) {
        toast.error(error.message || "Gagal menambahkan karyawan");
      }
    });
  };

  const openEditModal = (emp: EmployeeData) => {
    setEditName(emp.name);
    setEditNik(emp.nik || emp.username || "");
    setEditRole(emp.role as any);
    setEditDialog({ open: true, employee: emp });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.employee) return;
    if (!editName.trim() || !editNik.trim()) {
      toast.error("Nama dan NIK karyawan wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        await updateEmployee(editDialog.employee!.id, {
          name: editName,
          nik: editNik,
          role: editRole,
        });
        toast.success(`Data karyawan ${editName} berhasil diperbarui!`);
        setEditDialog({ open: false, employee: null });
        loadEmployees();
      } catch (error: any) {
        toast.error(error.message || "Gagal memperbarui data karyawan");
      }
    });
  };

  const handleToggleStatus = () => {
    if (!toggleDialog.employee) return;
    const emp = toggleDialog.employee;

    startTransition(async () => {
      try {
        const res = await toggleEmployeeStatus(emp.id);
        toast.success(
          res.isActive
            ? `Akun ${emp.name} berhasil diaktifkan kembali`
            : `Akun ${emp.name} telah dinonaktifkan`
        );
        setToggleDialog({ open: false, employee: null });
        loadEmployees();
      } catch (error: any) {
        toast.error(error.message || "Gagal mengubah status karyawan");
      }
    });
  };

  const totalActive = employees.filter((e) => e.isActive).length;
  const totalInactive = employees.filter((e) => !e.isActive).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Karyawan
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data akun pengguna, peran jabatan, dan hak akses karyawan pabrik
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-11 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Karyawan Baru
        </Button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Karyawan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Akun Aktif</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalActive}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Akun Nonaktif</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{totalInactive}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <UserX className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari nama, NIK, atau jabatan karyawan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 shadow-xs border-slate-200 focus-visible:ring-blue-600 rounded-xl py-2.5"
        />
      </div>

      {/* Professional Employee Table Card */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Karyawan Tidak Ditemukan</h3>
              <p className="text-slate-500 text-sm mt-1">
                Tidak ada data karyawan yang cocok dengan pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-200">
                    <TableHead className="w-12 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">#</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">Karyawan</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">Jabatan / Peran</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">Status Akun</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">Terdaftar Pada</TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5 pr-6">Aksi Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp, index) => {
                    const initials = emp.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow key={emp.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100">
                        <TableCell className="text-center font-mono text-xs text-slate-400 font-bold">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-slate-200">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm text-slate-900">
                                {emp.name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">
                                NIK: {emp.nik || emp.username || emp.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${roleBadgeStyles[emp.role] || "bg-slate-50 text-slate-700 border-slate-200"} font-bold text-xs px-2.5 py-1`}
                          >
                            <Shield className="w-3.5 h-3.5 mr-1" />
                            {roleLabels[emp.role] || emp.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {emp.isActive ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold text-xs px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 font-bold text-xs px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(emp.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(emp)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setToggleDialog({ open: true, employee: emp })
                              }
                              className={
                                emp.isActive
                                  ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 font-bold text-xs rounded-xl cursor-pointer"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border-0 cursor-pointer"
                              }
                            >
                              {emp.isActive ? (
                                <>
                                  <UserX className="w-3.5 h-3.5 mr-1.5" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                          </div>
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

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Tambah Karyawan Baru
            </DialogTitle>
            <DialogDescription>
              Isi data karyawan untuk membuat akun akses ke sistem NextGen Request
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nama Lengkap
              </Label>
              <Input
                id="add-name"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-nik" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                NIK Karyawan
              </Label>
              <Input
                id="add-nik"
                type="text"
                placeholder="800000"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password Akses Initial
              </Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sama dengan NIK jika kosong..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 rounded-xl border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-role" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Jabatan / Peran Access
              </Label>
              <Select
                value={role}
                onValueChange={(val: any) => setRole(val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih jabatan..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="leader">Production Leader</SelectItem>
                  <SelectItem value="supervisor">Supervisor Produksi</SelectItem>
                  <SelectItem value="plant_manager">Plant Manager</SelectItem>
                  <SelectItem value="ga">Tim General Affair (GA)</SelectItem>
                  <SelectItem value="purchasing">Tim Purchasing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="rounded-xl border-slate-300 font-semibold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Simpan Karyawan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, employee: open ? editDialog.employee : null })
        }
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <Pencil className="w-5 h-5 text-blue-600" />
              Edit Data Karyawan
            </DialogTitle>
            <DialogDescription>
              Ubah nama lengkap, NIK, dan jabatan untuk karyawan {editDialog.employee?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nama Lengkap
              </Label>
              <Input
                id="edit-name"
                placeholder="Nama lengkap karyawan..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nik" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                NIK Karyawan
              </Label>
              <Input
                id="edit-nik"
                placeholder="800000"
                value={editNik}
                onChange={(e) => setEditNik(e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Jabatan / Peran Access
              </Label>
              <Select
                value={editRole}
                onValueChange={(val: any) => setEditRole(val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih jabatan..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="leader">Production Leader</SelectItem>
                  <SelectItem value="supervisor">Supervisor Produksi</SelectItem>
                  <SelectItem value="plant_manager">Plant Manager</SelectItem>
                  <SelectItem value="ga">Tim General Affair (GA)</SelectItem>
                  <SelectItem value="purchasing">Tim Purchasing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog({ open: false, employee: null })}
                className="rounded-xl border-slate-300 font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4 mr-2" />
                )}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Confirmation Dialog */}
      <Dialog
        open={toggleDialog.open}
        onOpenChange={(open) =>
          setToggleDialog({ open, employee: open ? toggleDialog.employee : null })
        }
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-slate-900">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Konfirmasi Perubahan Status Akun
            </DialogTitle>
            <DialogDescription>
              {toggleDialog.employee?.isActive
                ? `Apakah Anda yakin ingin menonaktifkan akun ${toggleDialog.employee?.name}? Pengguna ini tidak akan bisa login ke sistem.`
                : `Apakah Anda yakin ingin mengaktifkan kembali akun ${toggleDialog.employee?.name}?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setToggleDialog({ open: false, employee: null })}
              className="rounded-xl border-slate-300 font-semibold"
            >
              Batal
            </Button>
            <Button
              variant={toggleDialog.employee?.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={isPending}
              className={
                toggleDialog.employee?.isActive
                  ? "bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              }
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : toggleDialog.employee?.isActive ? (
                <UserX className="w-4 h-4 mr-2" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              Ya, Ubah Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
