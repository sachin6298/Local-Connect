/**
 * LenderDashboard — Full-featured lender portal.
 * Tabs:
 *  - My Products (manage listings, pricing, activation)
 *  - Incoming Requests (review, accept, reject tourist rental requests)
 *  - Active Rentals (ongoing and confirmed rentals)
 *  - Availability Management (real-time availability overview, reserved stock)
 */
import { useState, useMemo, useCallback } from "react";
import {
  Handshake, ShieldCheck, Plus, PackageCheck, AlertCircle, Clock3,
  PauseCircle, PlayCircle, Edit3, CheckCircle2, CalendarDays, Inbox,
  XCircle, CheckCircle, Mail, Phone, Eye, User, Layers, RefreshCw,
  Loader2, ArrowRight, ShieldAlert, Sparkles, MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ItemModal, type ItemFormData } from "../lender/ItemModal";
import { LenderVerificationModal } from "../lender/LenderVerificationModal";
import { PriceEditModal, type EditablePriceItem } from "../../components/pricing/PriceEditModal";
import { useRequests, useRequestActions } from "../../hooks/useRequests";
import type { RentalRequest } from "../../api/requests";

const INITIAL_LENDER_ITEMS: ItemFormData[] = [
  {
    id: "sample-1",
    title: "White cotton dhoti & kurta set",
    category: "Clothing",
    description: "Pure cotton consecrated traditional dhoti and kurta set for Gaya Ji Pind-daan rituals.",
    condition: "Sanitised · Freshly washed",
    sizeOrVariant: "Standard free size",
    quantity: 8,
    rate: 120,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: false,
    publicLocation: "Vishnupad Main Ghat, Gaya",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",
    status: "active"
  },
  {
    id: "sample-3",
    title: "Travel backpack · 40L durable rucksack",
    category: "Backpacks",
    description: "Waterproof rucksack with padded straps, ideal for carrying essentials while visiting ghats.",
    condition: "Good condition",
    sizeOrVariant: "40 Litres",
    quantity: 4,
    rate: 60,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: true,
    publicLocation: "Gaya Junction Railway Area",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    status: "active"
  },
  {
    id: "sample-2",
    title: "Puja thali & utensil kit",
    category: "Puja materials",
    description: "Complete brass ceremonial kit including thali, ghanti, diya, and panchapatra.",
    condition: "Polished brass · Clean",
    sizeOrVariant: "Standard ritual size",
    quantity: 6,
    rate: 80,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: false,
    publicLocation: "Deoghat, Gaya",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800",
    status: "active"
  }
];

type LenderTab = "products" | "requests" | "active" | "availability";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  requested: { label: "Pending Approval", color: "bg-amber-100 text-amber-800" },
  accepted: { label: "Accepted / Reserved", color: "bg-emerald-100 text-emerald-800" },
  active: { label: "Active Rental", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-400" },
  expired: { label: "Expired", color: "bg-slate-100 text-slate-400" },
};

export function LenderDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<LenderTab>("products");
  const [items, setItems] = useState<ItemFormData[]>(INITIAL_LENDER_ITEMS);
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "submitted" | "draft">("approved");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [priceEditItem, setPriceEditItem] = useState<EditablePriceItem | null>(null);
  const [priceEditModalOpen, setPriceEditModalOpen] = useState(false);

  // Rejection dialog state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Details modal state
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);

  // Contact modal state
  const [contactTarget, setContactTarget] = useState<RentalRequest | null>(null);

  // Rental requests API
  const { requests, loading: loadingRequests, refresh: refreshRequests } = useRequests();

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4500);
  }, []);

  const { accepting, rejecting, acceptRequest, rejectRequest: doReject } = useRequestActions(
    (updated) => {
      showFeedback(`Request for "${updated.item_title}" updated to ${updated.status}.`);
      refreshRequests();
    },
    (err) => {
      showFeedback(`Action failed: ${err}`);
    }
  );

  function handlePriceUpdated(itemId: string, newRate: string, newUnit: string) {
    const numeric = parseFloat(newRate.replace(/[^0-9.]/g, ""));
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, rate: numeric, unit: newUnit.replace("per ", "").trim() } : it))
    );
    showFeedback(`Price updated to ${newRate} /${newUnit}`);
  }

  function handleCreateOrUpdateItem(formData: ItemFormData) {
    if (formData.id) {
      setItems((prev) => prev.map((item) => (item.id === formData.id ? formData : item)));
      showFeedback(`"${formData.title}" updated successfully.`);
    } else {
      const newItem: ItemFormData = {
        ...formData,
        id: `sample-${Date.now()}`,
        status: verificationStatus === "approved" ? "active" : "draft"
      };
      setItems((prev) => [newItem, ...prev]);
      showFeedback(`"${formData.title}" created as ${newItem.status}.`);
    }
  }

  function handleToggleStatus(itemId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newStatus = it.status === "active" ? "paused" : "active";
          showFeedback(`Listing status changed to ${newStatus}.`);
          return { ...it, status: newStatus };
        }
        return it;
      })
    );
  }

  async function handleConfirmReject() {
    if (!rejectingId) return;
    const ok = await doReject(rejectingId, rejectReason || undefined);
    if (ok) {
      setRejectingId(null);
      setRejectReason("");
    }
  }

  // Derived metrics
  const activeCount = items.filter((it) => it.status === "active").length;
  const pausedCount = items.filter((it) => it.status === "paused").length;
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "requested"), [requests]);
  const activeRentals = useMemo(() => requests.filter((r) => r.status === "accepted" || r.status === "active"), [requests]);
  const totalEarned = useMemo(() => {
    return requests
      .filter((r) => r.status === "accepted" || r.status === "active" || r.status === "completed")
      .reduce((sum, r) => sum + r.rental_subtotal, 0);
  }, [requests]);

  // Reserved quantity map per item
  const reservedQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of requests) {
      if (r.status === "requested" || r.status === "accepted" || r.status === "active") {
        map[r.item_id] = (map[r.item_id] || 0) + r.quantity;
      }
    }
    return map;
  }, [requests]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#17212F] p-8 text-white shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#A8DCD5]">
              <Handshake size={13} /> Local Lender Portal
            </span>

            {verificationStatus === "approved" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
                <ShieldCheck size={13} /> Verified Host
              </span>
            )}
            {verificationStatus === "submitted" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300">
                <Clock3 size={13} /> Verification Pending Admin Review
              </span>
            )}
            {verificationStatus === "draft" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-3 py-0.5 text-xs font-bold text-slate-300">
                Verification Required
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-black">{profile?.fullName || "Sharma Family Rentals"}</h1>
          <p className="mt-1 text-sm text-slate-400">Locality: Gaya Ji, Bihar · Earn from commodities you already own</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <ShieldCheck size={16} /> Verification Status
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-brandDark"
          >
            <Plus size={16} /> Add Listing
          </button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Listings</span>
          <p className="mt-3 text-3xl font-black text-ink">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Live in Gaya Ji catalogue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Incoming Requests</span>
          <p className="mt-3 text-3xl font-black text-amber-600">{pendingRequests.length}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting your approval</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Rentals</span>
          <p className="mt-3 text-3xl font-black text-brand">{activeRentals.length}</p>
          <p className="mt-1 text-xs text-slate-500">Reserved & ongoing</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Estimated Earnings</span>
          <p className="mt-3 text-3xl font-black text-teal">₹{totalEarned.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Gross rental revenue</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "products", label: "My Products", count: items.length },
          { key: "requests", label: "Incoming Requests", count: pendingRequests.length, highlight: pendingRequests.length > 0 },
          { key: "active", label: "Active Rentals", count: activeRentals.length },
          { key: "availability", label: "Availability Management", count: items.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as LenderTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : tab.highlight
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}

        <button
          onClick={() => refreshRequests()}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          title="Refresh Data"
        >
          <RefreshCw size={13} className={loadingRequests ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* TAB 1: MY PRODUCTS */}
      {activeTab === "products" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Your Listed Inventory in Gaya Ji</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Only items from approved lenders appear in public pilgrim searches.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{items.length} Total Items</span>
          </div>

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.id || item.title}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">· {item.condition}</span>
                    </div>
                    <p className="mt-1 font-extrabold text-ink">{item.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        Rate: <span className="font-bold text-ink">₹{item.rate}/{item.unit}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPriceEditItem({
                              id: item.id || `item-${item.title}`,
                              title: item.title,
                              rate: `₹${item.rate}`,
                              unit: item.unit,
                              image: item.image,
                              lender: profile?.fullName || "Sharma Family Rentals",
                            });
                            setPriceEditModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-brand hover:border-brand"
                          title="Edit price"
                        >
                          <Edit3 size={10} /> Edit Price
                        </button>
                      </span>
                      <span>· Quantity: <span className="font-bold text-ink">{item.quantity} units</span></span>
                      <span>· Location: <span className="text-slate-600">{item.publicLocation}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "paused"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(item.id!)}
                    title={item.status === "active" ? "Pause listing" : "Activate listing"}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand"
                  >
                    {item.status === "active" ? (
                      <>
                        <PauseCircle size={14} className="text-amber-600" /> Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle size={14} className="text-emerald-600" /> Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setItemModalOpen(true);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Incoming Product Requests</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Accepting a request atomically reserves the requested units and notifies the tourist.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{requests.length} Total Received</span>
          </div>

          {loadingRequests && requests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              <Loader2 size={24} className="mx-auto animate-spin text-brand" />
              <p className="mt-2">Loading incoming requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Inbox size={32} className="mx-auto text-slate-300" />
              <h4 className="mt-3 text-sm font-black text-ink">No product requests yet</h4>
              <p className="mt-1 text-xs text-slate-500">
                When tourists request items from your catalogue, they will appear here for your review and approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const statusCfg = STATUS_CONFIG[req.status] || { label: req.status, color: "bg-slate-100 text-slate-600" };
                const days = Math.max(
                  Math.ceil((new Date(req.rental_end).getTime() - new Date(req.rental_start).getTime()) / 86400000),
                  1
                );
                const isPending = req.status === "requested";

                return (
                  <div
                    key={req.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Tourist & Product details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            Requested on {new Date(req.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>

                        <h4 className="mt-2 text-base font-black text-ink">
                          {req.item_title}
                        </h4>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-bold text-ink">
                            <User size={13} className="text-brand" /> {req.tourist_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} className="text-slate-400" />
                            {new Date(req.rental_start).toLocaleDateString("en-IN", { dateStyle: "short" })}
                            {" → "}
                            {new Date(req.rental_end).toLocaleDateString("en-IN", { dateStyle: "short" })}
                            <span className="text-slate-400 font-normal">({days} day{days !== 1 ? "s" : ""})</span>
                          </span>
                          <span>Quantity: <strong className="text-ink">{req.quantity} unit(s)</strong></span>
                          <span>Handover: <strong className="capitalize text-ink">{req.handover_method}</strong></span>
                        </div>

                        {req.tourist_note && (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                            <span className="font-bold text-slate-700">Tourist Note:</span> "{req.tourist_note}"
                          </div>
                        )}
                      </div>

                      {/* Right: Pricing & Action buttons */}
                      <div className="flex flex-col items-end justify-between self-stretch gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-black text-brand">₹{req.total_amount.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400">
                            Subtotal: ₹{req.rental_subtotal.toFixed(2)} + Platform Fee
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            title="View full booking details"
                          >
                            <Eye size={13} /> Details
                          </button>

                          <button
                            onClick={() => setContactTarget(req)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            title="Contact tourist"
                          >
                            <Mail size={13} /> Contact
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => setRejectingId(req.id)}
                                disabled={rejecting.has(req.id)}
                                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {rejecting.has(req.id) ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                                Reject
                              </button>

                              <button
                                onClick={() => acceptRequest(req.id)}
                                disabled={accepting.has(req.id)}
                                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {accepting.has(req.id) ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                Accept Request
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE & ACCEPTED RENTALS */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Active & Reserved Rentals</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Rentals currently accepted, awaiting handover, or active with pilgrims.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{activeRentals.length} Active Bookings</span>
          </div>

          {activeRentals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <PackageCheck size={32} className="mx-auto text-slate-300" />
              <h4 className="mt-3 text-sm font-black text-ink">No active rentals right now</h4>
              <p className="mt-1 text-xs text-slate-500">
                When you accept incoming requests, they will transition to active and show here for handover tracking.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeRentals.map((req) => (
                <div key={req.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800">
                        {req.status}
                      </span>
                      <h4 className="mt-2 font-black text-ink">{req.item_title}</h4>
                      <p className="text-xs text-slate-500">Renter: <strong className="text-ink">{req.tourist_name}</strong></p>
                    </div>
                    <span className="text-lg font-black text-brand">₹{req.total_amount.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-3 border border-emerald-100 text-xs text-slate-600 space-y-1">
                    <p className="flex justify-between">
                      <span>Rental Dates:</span>
                      <strong className="text-ink">
                        {new Date(req.rental_start).toLocaleDateString("en-IN", { dateStyle: "short" })} → {new Date(req.rental_end).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Reserved Quantity:</span>
                      <strong className="text-ink">{req.quantity} unit(s)</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Handover Method:</span>
                      <strong className="capitalize text-ink">{req.handover_method}</strong>
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setContactTarget(req)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <Mail size={12} /> Contact Tourist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AVAILABILITY MANAGEMENT */}
      {activeTab === "availability" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Real-Time Inventory & Reservation Availability</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Calculates available stock dynamically based on active and accepted reservations.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{items.length} Tracked Commodities</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3.5">Commodity</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Total Quantity</th>
                  <th className="p-3.5 text-center">Reserved Units</th>
                  <th className="p-3.5 text-center">Available Units</th>
                  <th className="p-3.5">Availability Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const itemId = item.id || "";
                  const total = item.quantity;
                  const reserved = reservedQuantities[itemId] || 0;
                  const available = Math.max(total - reserved, 0);

                  const availStatus =
                    item.status === "paused"
                      ? "INACTIVE"
                      : available === 0
                      ? "UNAVAILABLE"
                      : available < total
                      ? "PARTIALLY AVAILABLE"
                      : "AVAILABLE";

                  const badgeColor =
                    availStatus === "AVAILABLE"
                      ? "bg-emerald-100 text-emerald-800"
                      : availStatus === "PARTIALLY AVAILABLE"
                      ? "bg-amber-100 text-amber-800"
                      : availStatus === "INACTIVE"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-red-100 text-red-800";

                  return (
                    <tr key={itemId || item.title} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 font-bold text-ink">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt="" className="h-9 w-9 rounded-lg object-cover border border-slate-200" />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">{item.category}</td>
                      <td className="p-3.5 text-center font-bold text-ink">{total}</td>
                      <td className="p-3.5 text-center font-bold text-amber-600">{reserved}</td>
                      <td className="p-3.5 text-center font-black text-emerald-700">{available}</td>
                      <td className="p-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${badgeColor}`}>
                          {availStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(item.id!)}
                          className="text-xs font-bold text-brand hover:underline"
                        >
                          {item.status === "active" ? "Pause" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Policy Reminder */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-brand" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand">Handover & Privacy Protections</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Never expose home addresses to renters. Rendezvous at verified public locations such as Gaya Junction or Vishnupad Ghat gates. Always record handover photos in the platform prior to item release to guarantee dispute protection and damage claim eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleCreateOrUpdateItem}
        initialData={editingItem}
      />

      <LenderVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onSubmitted={(status) => {
          setVerificationStatus(status as any);
          showFeedback("Verification documents submitted. Admin will review within 24 hours.");
        }}
        currentStatus={verificationStatus}
      />

      <PriceEditModal
        isOpen={priceEditModalOpen}
        onClose={() => setPriceEditModalOpen(false)}
        item={priceEditItem}
        onPriceUpdated={handlePriceUpdated}
      />

      {/* Reject Request Dialog */}
      {rejectingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setRejectingId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Reject Request"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-black text-ink">Reject Rental Request</h3>
            <p className="mt-1 text-xs text-slate-500">
              Please provide an optional reason for the tourist. The reserved slot will be released back to your available inventory immediately.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Item undergoing sanctification / already promised locally..."
              rows={3}
              className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-brand"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Rental Request Details"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-ink">Rental Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Item Title:</span>
                <span className="font-bold text-ink">{selectedRequest.item_title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Tourist Name:</span>
                <span className="font-bold text-ink">{selectedRequest.tourist_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Tourist Email:</span>
                <span className="font-mono text-slate-700">{selectedRequest.tourist_email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Requested Dates:</span>
                <span className="font-bold text-ink">
                  {selectedRequest.rental_start} → {selectedRequest.rental_end}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-ink">{selectedRequest.quantity} unit(s)</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Handover Preference:</span>
                <span className="capitalize font-bold text-ink">{selectedRequest.handover_method}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Rental Subtotal:</span>
                <span className="font-bold text-ink">₹{selectedRequest.rental_subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Platform Fee (10%):</span>
                <span className="text-slate-600">₹{selectedRequest.platform_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Total Charged:</span>
                <span className="font-black text-brand text-sm">₹{selectedRequest.total_amount.toFixed(2)}</span>
              </div>
              {selectedRequest.tourist_note && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-bold text-slate-700">Tourist Message:</span>
                  <p className="mt-1 text-slate-600 italic">"{selectedRequest.tourist_note}"</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Tourist Modal */}
      {contactTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setContactTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Contact Tourist"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-base font-black text-ink">Contact {contactTarget.tourist_name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Communicate with the tourist regarding handover location or specific ceremonial requests.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100 text-xs">
              <p className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-brand" />
                <span className="font-mono">{contactTarget.tourist_email}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-brand" />
                <span>+91 97777 33333 (Verified)</span>
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setContactTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <a
                href={`mailto:${contactTarget.tourist_email}?subject=LocalConnect Rental: ${contactTarget.item_title}`}
                className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brandDark inline-flex items-center gap-1.5"
              >
                <Mail size={13} />
                <span>Open Mail</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
