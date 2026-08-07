"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getServerTime } from "@/app/actions/time-actions";

export function ServerClock() {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [offset, setOffset] = useState<number>(0);

  const syncServerTime = async () => {
    try {
      const start = Date.now();
      const res = await getServerTime();
      const end = Date.now();
      const networkLatency = Math.floor((end - start) / 2);
      const currentServerTime = res.timestamp + networkLatency;
      const calculatedOffset = currentServerTime - Date.now();
      setOffset(calculatedOffset);
      setServerTime(new Date(Date.now() + calculatedOffset));
    } catch (err) {
      console.error("Failed to sync server time:", err);
      setServerTime(new Date());
    }
  };

  useEffect(() => {
    syncServerTime();
    const syncInterval = setInterval(syncServerTime, 60000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(new Date(Date.now() + offset));
    }, 1000);
    return () => clearInterval(timer);
  }, [offset]);

  if (!serverTime) {
    return (
      <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-lg" />
    );
  }

  const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(serverTime);
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(serverTime);

  const timeFormatted = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(serverTime).replace(/\./g, ":");

  return (
    <div
      className="no-print flex items-center gap-2 px-2.5 py-1 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 transition-all select-none"
      title="Waktu Server (Live)"
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
        <span className="text-slate-600">{dayName}, {dateFormatted}</span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold text-slate-900 tabular-nums">{timeFormatted} WIB</span>
      </div>

      {/* Medium Screen View */}
      <div className="hidden sm:flex lg:hidden items-center gap-1.5 text-xs font-medium">
        <span className="text-slate-600">{dateFormatted}</span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold text-slate-900 tabular-nums">{timeFormatted}</span>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden items-center text-xs font-semibold text-slate-900 tabular-nums">
        {timeFormatted}
      </div>
    </div>
  );
}
