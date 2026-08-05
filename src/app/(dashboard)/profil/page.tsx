"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/app/actions/user-actions";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  KeyRound,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  leader: "Production Leader",
  supervisor: "Supervisor Produksi",
  plant_manager: "Plant Manager",
};

export default function ProfilPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua kolom password wajib diisi");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    startTransition(async () => {
      try {
        await updatePassword({
          currentPassword,
          newPassword,
        });
        toast.success("Password Anda berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: any) {
        toast.error(error.message || "Gagal memperbarui password");
      }
    });
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const user = session?.user as any;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 mt-1">
          Pengaturan akun pengguna dan pembaruan kata sandi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <Card className="md:col-span-1 border border-slate-200 shadow-sm rounded-2xl bg-white h-fit">
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <Avatar className="w-20 h-20 mx-auto border-2 border-blue-500/20 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>

            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-bold text-xs px-3 py-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              {roleLabels[user?.role] || user?.role || "Karyawan"}
            </Badge>

            <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Pengguna:</span>
                <span className="font-mono font-bold text-slate-800 truncate max-w-[140px]">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Akun:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="md:col-span-2 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Ubah Password
            </CardTitle>
            <CardDescription>
              Perbarui kata sandi akun Anda secara berkala demi keamanan data pabrik
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-pwd" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  Password Lama Saat Ini
                </Label>
                <div className="relative">
                  <Input
                    id="current-pwd"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Masukkan password lama..."
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10 rounded-xl border-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-pwd" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  Password Baru (Min 6 Karakter)
                </Label>
                <div className="relative">
                  <Input
                    id="new-pwd"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Masukkan password baru..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 rounded-xl border-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  Konfirmasi Password Baru
                </Label>
                <Input
                  id="confirm-pwd"
                  type="password"
                  placeholder="Ulangi password baru..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Simpan Password Baru
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
