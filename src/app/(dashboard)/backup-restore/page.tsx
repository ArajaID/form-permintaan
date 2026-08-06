import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BackupRestoreClient } from "./backup-restore-client";

export default async function BackupRestorePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "plant_manager") {
    redirect("/dashboard");
  }

  return <BackupRestoreClient />;
}
