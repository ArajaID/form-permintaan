"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton({ status }: { status: string }) {
  const searchParams = useSearchParams();
  const isPrintable = status === "disetujui" || status === "diserahkan";

  useEffect(() => {
    if (searchParams.get("print") === "true" && isPrintable) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, isPrintable]);

  if (!isPrintable) {
    return null;
  }

  return (
    <Button
      onClick={() => window.print()}
      className="no-print bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 px-4 cursor-pointer"
    >
      <Printer className="w-4 h-4 mr-2" />
      Cetak Form Resmi A4 (PDF)
    </Button>
  );
}
