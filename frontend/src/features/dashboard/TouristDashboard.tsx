/**
 * TouristDashboard — Full featured tourist portal.
 * Tabs: Explore, Sent Requests, Active Rentals
 * Real request data from API with status badges and cancel actions.
 */
import { useState, useCallback } from "react";
import {
  Package, Clock3, CheckCircle2, Search, Sparkles, MapPin,
  XCircle, Loader2, RefreshCw, ChevronRight, CalendarDays, Inbox,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRequests, useRequestActions } from "../../hooks/useRequests";
import type { RentalRequest } from "../../api/requests";

interface TouristDashboardProps {
  onSearchCategory: (category: string) => void;
  onOpenChat: () => void;
}

type Tab = "explore" | "requests" | "active";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  requested: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-800" },
  active: { label: "Active", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-400" },
  expired: { label: "Expired", color: "bg-slate-100 text-slate-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function RequestCard({
  req,
  onCancel,
  cancelling,
}: {
  req: RentalRequest;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const canCancel = req.status === "requested" || req.status === "accepted";
  const days = Math.max(
    Math.ceil((new Date(req.rental_end).getTime() - new Date(req.rental_start).getTime()) / 86400000),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={req.status} />
            <span className="text-[10px] text-slate-400">
              {new Date(req.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>
          </div>
          <p className="mt-1.5 font-extrabold text-sm text-ink truncate">{req.item_title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">by {req.lender_name}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-black text-brand">₹{req.total_amount.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{days} day{days !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarDays size={11} />
          {new Date(req.rental_start).toLocaleDateString("en-IN", { dateStyle: "short" })}
          {" – "}
          {new Date(req.rental_end).toLocaleDateString("en-IN", { dateStyle: "short" })}
        </span>
        <span>· Qty: <span className="font-bold text-ink">{req.quantity}</span></span>
        <span>· {req.handover_method}</span>
      </div>

      {req.tourist_note && (
        <p className="mt-2 text-[11px] italic text-slate-400">Note: "{req.tourist_note}"</p>
      )}

      {canCancel && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onCancel(req.id)}
            disabled={cancelling}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {cancelling ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
}

export function TouristDashboard({ onSearchCategory, onOpenChat }: TouristDashboardProps) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("explore");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  }, []);

  const { requests, loading, error, refresh } = useRequests();

  const { cancelling, cancelRequest } = useRequestActions(
    (updated) => {
      refresh();
      showToast(`Request for "${updated.item_title}" cancelled.`);
    },
    showToast
  );

  // Computed metrics
  const activeCount = requests.filter((r) => r.status === "active").length;
  const pendingCount = requests.filter((r) => r.status === "requested").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;
  const activeRequests = requests.filter((r) => r.status === "active" || r.status === "accepted");

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "explore", label: "Browse & Explore", icon: <Search size={14} /> },
    { id: "requests", label: `Sent Requests${requests.length > 0 ? ` (${requests.length})` : ""}`, icon: <Inbox size={14} /> },
    { id: "active", label: "Active Rentals", icon: <Package size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brandDark via-brand to-[#2C8C86] p-8 text-white shadow-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={13} /> Tourist Portal
        </span>
        <h1 className="mt-4 text-3xl font-black">
          Welcome back, {profile?.fullName || "Tourist"}!
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
          Search and rent commodities directly from local families in Gaya Ji. Enjoy transparent rates and supervised rental terms.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => { setTab("explore"); onSearchCategory("All items"); }}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-brand transition hover:bg-blue-50"
          >
            <Search size={15} /> Explore Gaya Rentals
          </button>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
          >
            <Sparkles size={15} /> Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Rentals</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand">
              <Package size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Items currently in your custody</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Requests</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">{pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting local lender decision</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Completed Rentals</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/10 text-teal">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">{completedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Returned in verified condition</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toast}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              tab === t.id
                ? "bg-white text-ink shadow-sm"
                : "text-slate-500 hover:text-ink"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "explore" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-ink">Recommended for Gaya Ji / Pitru Paksha</h3>
          <p className="mt-1 text-xs text-slate-500">Temporary necessities you do not need to buy for a short pilgrimage stay</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "White cotton clothes", cat: "Clothing", loc: "Vishnupad East Gate" },
              { title: "Puja thali & brass lota", cat: "Puja materials", loc: "Deoghat Riverside" },
              { title: "Cooking utensil set", cat: "Utensils", loc: "Mangla Gauri Road" },
              { title: "Travel backpack 40L", cat: "Backpacks", loc: "Gaya Junction Area" },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => onSearchCategory(item.cat)}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left transition hover:border-brand/40 hover:bg-blue-50/40"
              >
                <span className="text-xs font-extrabold uppercase tracking-wide text-teal">{item.cat}</span>
                <p className="mt-1 font-bold text-ink">{item.title}</p>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={12} /> {item.loc}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-brand">
                  Browse <ChevronRight size={11} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-ink">Sent Requests</h3>
              <p className="mt-0.5 text-xs text-slate-500">All rental requests you have submitted to local lenders</p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-brand"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {loading && requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Loading your requests…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              {error} — Make sure the backend is running.
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Inbox size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-bold">No requests yet</p>
              <p className="mt-1 text-xs">Browse items and click "Request to Rent" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onCancel={(id) => cancelRequest(id)}
                  cancelling={cancelling.has(req.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "active" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-ink">Active Rentals</h3>
          <p className="mt-0.5 text-xs text-slate-500">Accepted & in-progress rentals</p>

          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Package size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-bold">No active rentals</p>
              <p className="mt-1 text-xs">Your accepted and active rentals will appear here.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activeRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onCancel={(id) => cancelRequest(id)}
                  cancelling={cancelling.has(req.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
