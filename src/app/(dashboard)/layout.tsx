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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).isActive === false) {
    redirect("/login?error=deactivated");
  }

  const unreadCount = await getUnreadCount();

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || "leader",
      }}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
