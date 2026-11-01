/**
 * NotificationsBell — Header notification icon with dropdown.
 * Shows unread count badge, recent notifications, mark-as-read.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck, Info } from "lucide-react";
import { notificationsApi, type Notification } from "../../api/requests";
import { useAuth } from "../../context/AuthContext";

export function NotificationsBell() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } catch {
      /* silent — bell is non-critical */
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleMarkRead(id: string) {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch { /* silent */ }
  }

  async function handleMarkAll() {
    try {
      await notificationsApi.markAllRead();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    } catch { /* silent */ }
  }

  if (!profile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand hover:text-brand"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">Notifications</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                >
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-ink">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && handleMarkRead(n.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${!n.read_at ? "bg-blue-50/40" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <Info size={13} className={`mt-0.5 shrink-0 ${!n.read_at ? "text-brand" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${!n.read_at ? "text-ink" : "text-slate-600"}`}>{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{n.content}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    {!n.read_at && <span className="ml-auto mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

