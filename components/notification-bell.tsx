"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;

    async function loadNotifications() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (cancelled) return;

      if (error) {
        console.error("Notification loading error:", error);
      } else {
        setNotifications(data || []);
      }

      // Unique channel name prevents reuse of an already-subscribed channel.
      channel = supabase
        .channel(`notifications-${user.id}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;

            setNotifications((previous) => {
              if (previous.some((n) => n.id === newNotification.id)) {
                return previous;
              }

              return [newNotification, ...previous].slice(0, 30);
            });
          }
        );

      if (cancelled) return;

      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Notification realtime subscription failed.");
        }
      });

      setLoading(false);
    }

    loadNotifications();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      if (error) {
        console.error("Notification update error:", error);
        return;
      }

      setNotifications((previous) =>
        previous.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    setOpen(false);

    if (notification.type === "match") {
      router.push("/matches");
    } else if (notification.type === "message") {
      router.push("/messages");
    } else if (notification.type === "interest") {
      router.push("/matches");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-gray-200 bg-white p-3 text-xl shadow-sm hover:bg-gray-50"
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-96">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold text-gray-900">Notifications</h3>

              <span className="text-xs text-gray-500">
                {unreadCount} unread
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  Loading...
                </p>
              ) : notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full border-b p-4 text-left transition hover:bg-violet-50 ${
                      notification.is_read ? "bg-white" : "bg-violet-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">
                        {notification.type === "match"
                          ? "🎉"
                          : notification.type === "message"
                            ? "💬"
                            : "❤️"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {notification.body}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}