"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Quote, Zap, Sun, Moon, Sunrise, Sunset, Flame } from "lucide-react";

const emptySubscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const motivationalQuotes = [
  // Semangat Kerja & Profesionalisme Umum
  {
    quote: "Keberhasilan besar hari ini dibangun dari komitmen kecil dan kedisiplinan yang konsisten sejak langkah pertama.",
    category: "Semangat Kerja",
    author: "AI Daily Motivation",
  },
  {
    quote: "Setiap tantangan di tempat kerja adalah panggung untuk membuktikan dedikasi, integritas, dan kualitas diri kita.",
    category: "Pengembangan Diri",
    author: "AI Career Coach",
  },
  {
    quote: "Semangat dan energi positif yang Anda bawa hari ini akan menularkan keberhasilan bagi seluruh rekan kerja di tim.",
    category: "Energi Positif",
    author: "AI Team Booster",
  },
  {
    quote: "Fokus pada proses terbaik, berikan perhatian penuh, dan hasil kerja yang membanggakan akan mengikuti.",
    category: "Fokus & Kinerja",
    author: "AI Mindset Guide",
  },
  {
    quote: "Kerja tim yang hebat bukan tentang siapa yang paling menonjol, melainkan bagaimana kita saling melengkapi demi tujuan bersama.",
    category: "Kerjasama Tim",
    author: "AI Synergy Hub",
  },
  {
    quote: "Pekerjaan luar biasa dihasilkan oleh insan yang mengerjakan tugasnya dengan penuh rasa tanggung jawab dan rasa bangga.",
    category: "Dedikasi & Bangga",
    author: "AI Workplace Excellence",
  },
  {
    quote: "Jadikan hari ini lebih produktif dari kemarin. Setiap kerja keras yang tulus tidak akan pernah mengkhianati hasil.",
    category: "Pencapaian Diri",
    author: "AI Growth Partner",
  },
  {
    quote: "Inovasi dan perbaikan berkelanjutan (Kaizen) dimulai dari keberanian memberikan hasil terbaik di setiap tugas sederhana.",
    category: "Kaizen & Inovasi",
    author: "AI Quality Leader",
  },
  // Kualitas Operasional & Manufaktur
  {
    quote: "Kualitas barang produksi yang prima lahir dari ketelitian dan integritas di setiap langkah permintaan.",
    category: "Standar Kualitas",
    author: "AI Production Mindset",
  },
  {
    quote: "Efisiensi alur kerja barang hari ini adalah kunci kelancaran target pabrik besok pagi.",
    category: "Produktivitas Manufaktur",
    author: "AI Smart Logistics",
  },
  {
    quote: "Setiap barang produksi yang tercatat dengan rapi adalah bukti profesionalisme dan kepedulian tim.",
    category: "Manajemen Material",
    author: "AI Inventory Assistant",
  },
  {
    quote: "Kerja keras menciptakan produk, kerja cerdas dan jujur menjaga mutu serta kepercayaan perusahaan.",
    category: "Integritas Kerja",
    author: "AI Leadership Insights",
  },
  {
    quote: "Perencanaan material yang akurat menghindarkan dari kemacetan lini produksi. Sukses ada di detail kecil.",
    category: "Pengawasan Operasional",
    author: "AI Factory Operations",
  },
  {
    quote: "Keselamatan kerja dan ketepatan jumlah permintaan adalah dua pilar utama keberhasilan operasional.",
    category: "Operasional Unggul",
    author: "AI Safety & Supply Guard",
  },
  {
    quote: "Kedisiplinan dalam verifikasi dokumen adalah bentuk proteksi tertinggi terhadap kualitas produksi pabrik.",
    category: "Kontrol Kualitas",
    author: "AI Quality Assurance",
  },
  {
    quote: "Kerjasama yang baik antara Production Leader, Supervisor, GA, dan Purchasing adalah jantung operasional kita.",
    category: "Sinergi Divisi",
    author: "AI Supply Chain Intelligence",
  },
];

interface AIMotivationalCardProps {
  userName?: string;
}

export function AIMotivationalCard({ userName = "Karyawan" }: AIMotivationalCardProps) {
  const mounted = useHasMounted();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * motivationalQuotes.length));
  }, []);

  const handleNextQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * motivationalQuotes.length);
      if (nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % motivationalQuotes.length;
      }
      setCurrentIndex(nextIndex);
      setIsAnimating(false);
    }, 200);
  };

  let greeting = "Selamat Datang";
  let TimeIcon: any = Sun;

  if (mounted) {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      greeting = "Selamat Pagi";
      TimeIcon = Sunrise;
    } else if (hour >= 11 && hour < 15) {
      greeting = "Selamat Siang";
      TimeIcon = Sun;
    } else if (hour >= 15 && hour < 18) {
      greeting = "Selamat Sore";
      TimeIcon = Sunset;
    } else {
      greeting = "Selamat Malam";
      TimeIcon = Moon;
    }
  }

  if (!mounted) {
    return (
      <Card className="relative overflow-hidden border border-indigo-100/30 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl min-h-[160px] animate-pulse" />
    );
  }

  const current = motivationalQuotes[currentIndex];

  return (
    <Card className="relative overflow-hidden border border-indigo-100/30 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl">
      {/* Dynamic Background Glow & Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-indigo-500 to-purple-600" />
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-56 h-56 text-indigo-300" />
      </div>

      <CardContent className="relative z-10 p-6 sm:p-7 space-y-5">
        {/* Header Greeting & User Encouragement */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <TimeIcon className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  {greeting},{" "}
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-300/30 font-black shadow-inner">
                    {userName}
                  </span>
                  ! 👋
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0 animate-pulse" />
                Tetap semangat berikan kinerja terbaik dan jaga kelancaran operasional hari ini!
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextQuote}
            className="text-xs font-semibold text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer self-end sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAnimating ? "animate-spin" : ""}`} />
            Acak Motivasi Baru
          </Button>
        </div>

        {/* Motivational AI Quote Box */}
        <div className={`transition-opacity duration-300 ${isAnimating ? "opacity-20" : "opacity-100"}`}>
          <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <Quote className="w-7 h-7 text-indigo-400 flex-shrink-0 rotate-180 -mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-100 italic">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  Kategori: {current.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  — Motivasi AI: <strong className="text-indigo-300">{current.author}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
