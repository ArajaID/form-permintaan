"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package,
  ClipboardList,
  CheckSquare,
  History,
  BarChart3,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Bell,
  Home,
  Users,
  UserCog,
  Database,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

const allMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["leader", "supervisor", "plant_manager"],
  },
  {
    label: "Buat Permintaan",
    href: "/buat-permintaan",
    icon: ClipboardList,
    roles: ["leader"],
  },
  {
    label: "Antrean Permintaan",
    href: "/antrean-permintaan",
    icon: CheckSquare,
    roles: ["supervisor", "plant_manager"],
  },
  {
    label: "Riwayat Permintaan",
    href: "/riwayat-permintaan",
    icon: History,
    roles: ["leader", "supervisor", "plant_manager"],
  },
  {
    label: "Stok Barang",
    href: "/stok",
    icon: Package,
    roles: ["leader", "supervisor", "plant_manager"],
  },
  {
    label: "Stok Masuk",
    href: "/stok-masuk",
    icon: ArrowDownToLine,
    roles: ["supervisor", "plant_manager"],
  },
  {
    label: "Stok Keluar",
    href: "/stok-keluar",
    icon: ArrowUpFromLine,
    roles: ["supervisor", "plant_manager"],
  },
  {
    label: "Kartu Stok",
    href: "/kartu-stok",
    icon: FileText,
    roles: ["leader", "supervisor", "plant_manager"],
  },
  {
    label: "Manajemen Karyawan",
    href: "/karyawan",
    icon: Users,
    roles: ["supervisor", "plant_manager"],
  },
  {
    label: "Backup & Restore",
    href: "/backup-restore",
    icon: Database,
    roles: ["plant_manager"],
  },
  {
    label: "Notifikasi",
    href: "/notifikasi",
    icon: Bell,
    roles: ["leader", "supervisor", "plant_manager"],
  },
  {
    label: "Profil Saya",
    href: "/profil",
    icon: UserCog,
    roles: ["leader", "supervisor", "plant_manager"],
  },
];

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "no-print fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight text-white">NextGen Request</h1>
                <p className="text-xs text-slate-400">Sistem Permintaan Barang</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            const isProfil = item.href === "/profil";

            return (
              <div key={item.href}>
                {isProfil && (
                  <div className="my-3 border-t border-white/10" />
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-md")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2">
            <p className="text-xs text-slate-500">
              © 2026 NextGen Request
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
