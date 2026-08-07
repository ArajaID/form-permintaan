import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "./dashboard-shell";
import { getUnreadCount } from "@/app/actions/notification-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || (session.user as any).isActive === false) {
    redirect("/login?error=deactivated");
  }

  const role = (session.user as any).role || "leader";
  const pathname = reqHeaders.get("x-pathname") || "";

  // Strict route authorization check for GA and Purchasing roles
  if (role === "ga" || role === "purchasing") {
    // Explicitly forbidden: /dashboard, /stok, /stok-masuk, /stok-keluar, /antrean-permintaan, /buat-permintaan, /riwayat-permintaan, /karyawan, /backup-restore
    const isAllowed =
      pathname.startsWith("/penyerahan-barang") ||
      pathname.startsWith("/profil") ||
      pathname.startsWith("/notifikasi") ||
      (pathname.startsWith("/riwayat-permintaan/") && pathname.split("/").length > 2);

    if (!isAllowed) {
      redirect("/penyerahan-barang");
    }
  }

  const unreadCount = await getUnreadCount();

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: role,
      }}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
