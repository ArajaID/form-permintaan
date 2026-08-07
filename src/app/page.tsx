import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as any)?.role;

  if (role === "ga" || role === "purchasing") {
    redirect("/penyerahan-barang");
  }

  redirect("/dashboard");
}
