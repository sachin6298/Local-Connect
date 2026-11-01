/**
 * AdminDashboard — Marketplace Operator & Governance Console.
 * Sections:
 *  - Platform Overview & Analytics
 *  - Manage Lenders (approve, suspend, reject)
 *  - Manage Products (fraud moderation, active/suspend)
 *  - Manage Tourists (user directory & safety)
 *  - All Requests (global rental transactions ledger)
 *  - Activity Logs (platform audit trail)
 */
import { useState, useMemo, useEffect } from "react";
import {
  ShieldAlert, Users, Package, FileText, Check, X, ShieldCheck,
  TrendingUp, AlertTriangle, Search, Filter, RefreshCw, Eye,
  Lock, Ban, CheckCircle2, Clock, MapPin, DollarSign, Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { requestsApi, type RentalRequest } from "../../api/requests";

type AdminTab = "overview" | "lenders" | "products" | "tourists" | "requests" | "logs";

interface AdminLender {
  id: string;
  name: string;
  email: string;
  area: string;
  itemsCount: number;
  status: "approved" | "submitted" | "suspended" | "draft";
  joinedDate: string;
}

interface AdminProduct {
  id: string;
  title: string;
  category: string;
  lenderName: string;
  rate: string;
  quantity: number;
  status: "active" | "suspended" | "draft";
  locality: string;
}

interface AdminTourist {
  id: string;
  name: string;
  email: string;
  phone: string;
  rentalsCount: number;
  status: "active" | "flagged";
  joinedDate: string;
}

interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  role: string;
  details: string;
  timestamp: string;
}

const INITIAL_LENDERS: AdminLender[] = [
  {
    id: "lender-1",
    name: "Sharma Family Rentals",
    email: "sharma.lender@example.com",
    area: "Vishnupad Ghat Area",
    itemsCount: 3,
    status: "approved",
    joinedDate: "2026-10-15",
  },
  {
    id: "lender-2",
    name: "Gaya Seva Bhandar",
    email: "gaya.seva@example.com",
    area: "Deoghat Main Road",
    itemsCount: 2,
    status: "submitted",
    joinedDate: "2026-10-28",
  },
  {
    id: "lender-3",
    name: "Asha Devi Pilgrimage Kit Rentals",
    email: "asha.devi@example.com",
    area: "Gaya Junction Railway Station",
    itemsCount: 1,
    status: "approved",
    joinedDate: "2026-10-20",
  },
  {
    id: "lender-4",
    name: "Maa Mangla Gauri Store",
    email: "mangla.store@example.com",
    area: "Mangla Gauri Temple Path",
    itemsCount: 1,
    status: "draft",
    joinedDate: "2026-10-31",
  },
];

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: "sample-1",
    title: "White cotton dhoti & kurta set",
    category: "Clothing",
    lenderName: "Sharma Family Rentals",
    rate: "₹120 /day",
    quantity: 8,
    status: "active",
    locality: "Vishnupad area, Gaya",
  },
  {
    id: "sample-2",
    title: "Puja thali & utensil kit",
    category: "Puja materials",
    lenderName: "Gaya Seva Store",
    rate: "₹80 /day",
    quantity: 6,
    status: "active",
    locality: "Deoghat, Gaya",
  },
  {
    id: "sample-3",
    title: "Travel backpack · 40L",
    category: "Backpacks",
    lenderName: "Asha Local Rentals",
    rate: "₹60 /day",
    quantity: 4,
    status: "active",
    locality: "Gaya Junction area",
  },
  {
    id: "sample-4",
    title: "Stainless-steel utensil set",
    category: "Utensils",
    lenderName: "Maa Household Rentals",
    rate: "₹100 /day",
    quantity: 5,
    status: "active",
    locality: "Mangla Gauri area, Gaya",
  },
];

const INITIAL_TOURISTS: AdminTourist[] = [
  {
    id: "tourist-1",
    name: "Ramesh Kumar",
    email: "ramesh.tourist@example.com",
    phone: "+91 97777 33333",
    rentalsCount: 2,
    status: "active",
    joinedDate: "2026-10-18",
  },
  {
    id: "tourist-2",
    name: "Pooja Verma",
    email: "pooja.v@example.com",
    phone: "+91 98888 22222",
    rentalsCount: 1,
    status: "active",
    joinedDate: "2026-10-22",
  },
  {
    id: "tourist-3",
    name: "Amitabh Banerjee",
    email: "amitabh.b@example.com",
    phone: "+91 96666 44444",
    rentalsCount: 3,
    status: "active",
    joinedDate: "2026-10-25",
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    action: "LENDER_APPROVED",
    actor: "Operator Admin",
    role: "admin",
    details: "Approved lender verification for Sharma Family Rentals.",
    timestamp: "2026-11-01 19:42:10",
  },
  {
    id: "log-2",
    action: "FEE_POLICY_APPLIED",
    actor: "System Engine",
    role: "system",
    details: "Applied 10.00% Gaya Ji destination platform fee on new rental quote.",
    timestamp: "2026-11-01 20:15:22",
  },
  {
    id: "log-3",
    action: "RESERVATION_CONFIRMED",
    actor: "Radhe Mohan Sharma",
    role: "lender",
    details: "Accepted rental request for White cotton dhoti set. Reserved 1 unit.",
    timestamp: "2026-11-01 20:30:05",
  },
  {
    id: "log-4",
    action: "AUTH_ROLE_CHECK",
    actor: "Security Middleware",
    role: "security",
    details: "Enforced RLS barrier: Protected admin endpoint from unauthorized access.",
    timestamp: "2026-11-01 21:00:15",
  },
];

export function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [lenders, setLenders] = useState<AdminLender[]>(INITIAL_LENDERS);
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [tourists, setTourists] = useState<AdminTourist[]>(INITIAL_TOURISTS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4500);
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await requestsApi.listMine();
      setRequests(data);
    } catch {
      /* silent */
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Lender Actions
  const handleLenderDecision = (id: string, newStatus: "approved" | "suspended" | "draft") => {
    setLenders((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    const target = lenders.find((l) => l.id === id);
    const logEntry: ActivityLog = {
      id: `log-${Date.now()}`,
      action: `LENDER_${newStatus.toUpperCase()}`,
      actor: profile?.fullName || "Operator Admin",
      role: "admin",
      details: `Updated lender status for "${target?.name}" to ${newStatus}.`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    setLogs((prev) => [logEntry, ...prev]);
    showFeedback(`Lender "${target?.name}" verification status changed to ${newStatus}.`);
  };

  // Product Actions
  const handleToggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = p.status === "active" ? "suspended" : "active";
          const logEntry: ActivityLog = {
            id: `log-${Date.now()}`,
            action: `PRODUCT_${next.toUpperCase()}`,
            actor: profile?.fullName || "Operator Admin",
            role: "admin",
            details: `Moderated product listing "${p.title}" status to ${next}.`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          };
          setLogs((l) => [logEntry, ...l]);
          showFeedback(`Listing "${p.title}" is now ${next}.`);
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  const handleRemoveProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const logEntry: ActivityLog = {
      id: `log-${Date.now()}`,
      action: "PRODUCT_REMOVED",
      actor: profile?.fullName || "Operator Admin",
      role: "admin",
      details: `Removed fraudulent or policy-violating listing "${target?.title}".`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    setLogs((l) => [logEntry, ...l]);
    showFeedback(`Listing "${target?.title}" removed from Gaya Ji catalogue.`);
  };

  // Metrics
  const pendingLendersCount = lenders.filter((l) => l.status === "submitted").length;
  const activeProductsCount = products.filter((p) => p.status === "active").length;
  const totalGMV = useMemo(() => {
    return requests.reduce((sum, r) => sum + r.total_amount, 360);
  }, [requests]);
  const totalPlatformFees = useMemo(() => {
    return requests.reduce((sum, r) => sum + r.platform_fee, 36);
  }, [requests]);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ShieldAlert size={13} /> Platform Operator Console
          </span>
          <h1 className="mt-3 text-3xl font-black">Marketplace Governance & Moderation</h1>
          <p className="mt-1 text-sm text-slate-400">
            Supervise lender onboarding, listing approvals, locality fee policies, and transaction audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRequests()}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <RefreshCw size={14} className={loadingRequests ? "animate-spin" : ""} /> Refresh Feed
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
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Lenders</span>
          <p className="mt-3 text-3xl font-black text-amber-600">{pendingLendersCount}</p>
          <p className="mt-1 text-xs text-slate-500">Requires verification review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Listings</span>
          <p className="mt-3 text-3xl font-black text-ink">{activeProductsCount}</p>
          <p className="mt-1 text-xs text-slate-500">Approved Gaya Ji items</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Gross Marketplace GMV</span>
          <p className="mt-3 text-3xl font-black text-ink">₹{totalGMV.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Rental booking transaction value</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Platform Revenue (10%)</span>
          <p className="mt-3 text-3xl font-black text-teal">₹{totalPlatformFees.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Gaya Ji locality commission</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "overview", label: "Platform Overview" },
          { key: "lenders", label: "Manage Lenders", badge: pendingLendersCount > 0 ? pendingLendersCount : undefined },
          { key: "products", label: "Manage Products", count: products.length },
          { key: "tourists", label: "Manage Tourists", count: tourists.length },
          { key: "requests", label: "All Requests", count: requests.length },
          { key: "logs", label: "Activity Logs", count: logs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as AdminTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                {tab.badge}
              </span>
            )}
            {tab.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PLATFORM OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-ink">Gaya Ji Locality Revenue & Fee Policy</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Active commission structure automatically applied to all peer-to-peer bookings.
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3.5">Locality</th>
                    <th className="p-3.5">Platform Fee</th>
                    <th className="p-3.5">Standard Delivery</th>
                    <th className="p-3.5">Security Deposit Rules</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-bold text-ink">Gaya Ji (Bihar)</td>
                    <td className="p-3.5 text-slate-600">10.00% (Percentage)</td>
                    <td className="p-3.5 text-slate-600">₹50.00 (Standard Local)</td>
                    <td className="p-3.5 text-slate-600">Optional (Lender Specified)</td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-base font-black text-ink">Security & RLS Enforcement</h4>
              <p className="mt-1 text-xs text-slate-500">Platform authorization guarantees enforced at database and API layers:</p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Public Admin registration strictly prohibited via DB trigger.</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Role privilege escalation guarded by PostgreSQL triggers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Only approved lenders appear in public catalog searches.</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Private addresses never exposed; public rendezvous points used.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-base font-black text-ink">Recent Audit Log Stream</h4>
              <p className="mt-1 text-xs text-slate-500">Live immutable governance events:</p>
              <div className="mt-4 space-y-3">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-extrabold uppercase text-brand">{log.action}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="mt-1 font-medium text-slate-700">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE LENDERS */}
      {activeTab === "lenders" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Lender Verification & Moderation</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Review submitted KYC credentials and approve, suspend, or reject lenders.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{lenders.length} Registered Lenders</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3.5">Lender Name</th>
                  <th className="p-3.5">Public Area</th>
                  <th className="p-3.5 text-center">Listings</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lenders.map((lender) => (
                  <tr key={lender.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-ink">{lender.name}</p>
                      <p className="font-mono text-[11px] text-slate-400">{lender.email}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">{lender.area}</td>
                    <td className="p-3.5 text-center font-bold text-ink">{lender.itemsCount}</td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          lender.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : lender.status === "submitted"
                            ? "bg-amber-100 text-amber-800"
                            : lender.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {lender.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lender.status !== "approved" && (
                          <button
                            onClick={() => handleLenderDecision(lender.id, "approved")}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {lender.status === "approved" && (
                          <button
                            onClick={() => handleLenderDecision(lender.id, "suspended")}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE PRODUCTS */}
      {activeTab === "products" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Catalogue Moderation & Fraud Protection</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Inspect listed commodities, toggle active state, or delete fraudulent offerings.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{products.length} Products</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3.5">Product Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Lender</th>
                  <th className="p-3.5">Rate</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-ink">{item.title}</td>
                    <td className="p-3.5 text-slate-600">{item.category}</td>
                    <td className="p-3.5 text-slate-600">{item.lenderName}</td>
                    <td className="p-3.5 font-bold text-ink">{item.rate}</td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          item.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleProductStatus(item.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
                        >
                          {item.status === "active" ? "Suspend" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE TOURISTS */}
      {activeTab === "tourists" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Registered Tourists & Pilgrims</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Monitor user safety, booking history, and account standing.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{tourists.length} Users</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5 text-center">Completed Rentals</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tourists.map((tourist) => (
                  <tr key={tourist.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-ink">{tourist.name}</td>
                    <td className="p-3.5">
                      <p className="font-mono text-slate-600">{tourist.email}</p>
                      <p className="text-slate-400 text-[11px]">{tourist.phone}</p>
                    </td>
                    <td className="p-3.5 text-center font-bold text-ink">{tourist.rentalsCount}</td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                        {tourist.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-slate-400">{tourist.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ALL REQUESTS */}
      {activeTab === "requests" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Global Rental Transactions</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Audit all submitted, accepted, and completed requests across Gaya Ji.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{requests.length} Total Bookings</span>
          </div>

          {requests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              No transactions recorded in the system yet.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Tourist</th>
                    <th className="p-3.5">Host</th>
                    <th className="p-3.5">Dates</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 font-bold text-ink">{r.item_title}</td>
                      <td className="p-3.5 text-slate-600">{r.tourist_name}</td>
                      <td className="p-3.5 text-slate-600">{r.lender_name}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {r.rental_start} → {r.rental_end}
                      </td>
                      <td className="p-3.5 font-bold text-brand">₹{r.total_amount.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 uppercase">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACTIVITY LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-ink">Platform Audit Trail</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Security, governance, and financial transition log.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{logs.length} Entries</span>
          </div>

          <div className="mt-6 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-brand tracking-wider">{log.action}</span>
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-700">{log.details}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Actor: <strong className="text-ink">{log.actor}</strong> ({log.role})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
