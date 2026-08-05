"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notification-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type NotificationData = Awaited<ReturnType<typeof getNotifications>>[number];

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id: number) => {
    startTransition(async () => {
      await markAsRead(id);
      loadNotifications();
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      loadNotifications();
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <BellOff className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-medium">Belum ada notifikasi</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Notifikasi akan muncul saat ada pembaruan permintaan
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border-0 transition-all duration-200 cursor-pointer ${
                notif.isRead
                  ? "shadow-sm bg-white"
                  : "shadow-md bg-blue-50/50 hover:shadow-lg"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.isRead
                        ? "bg-slate-100 text-slate-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        notif.isRead
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.requestId && (
                        <Link
                          href={`/riwayat-permintaan/${notif.requestId}`}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          Lihat Permintaan
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={isPending}
                      className="text-xs"
                    >
                      Dibaca
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
