import { Handshake, ShieldCheck, Plus, PackageCheck, AlertCircle, Clock3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LenderDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#17212F] p-8 text-white shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#A8DCD5]">
              <Handshake size={13} /> Local Lender Portal
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
              <ShieldCheck size={13} /> Approved Lender
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-black">{profile?.fullName || "Local Lender"}</h1>
          <p className="mt-1 text-sm text-slate-400">Locality: Gaya Ji, Bihar · Earn from commodities you already own</p>
        </div>

        <button
          onClick={() => alert("Item listing manager will open once the item catalogue module is active.")}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white transition hover:bg-brandDark"
        >
          <Plus size={16} /> Create New Listing
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Listings</span>
          <p className="mt-3 text-3xl font-black text-ink">4</p>
          <p className="mt-1 text-xs text-slate-500">Live in Gaya Ji catalogue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Incoming Requests</span>
          <p className="mt-3 text-3xl font-black text-amber-600">0</p>
          <p className="mt-1 text-xs text-slate-500">Needs your review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Completed Rentals</span>
          <p className="mt-3 text-3xl font-black text-ink">0</p>
          <p className="mt-1 text-xs text-slate-500">Safely returned & inspected</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Lender Earnings</span>
          <p className="mt-3 text-3xl font-black text-teal">₹0.00</p>
          <p className="mt-1 text-xs text-slate-500">Tracked in payment ledger</p>
        </div>
      </div>

      {/* Current Listings Snapshot */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-ink">Your Listed Inventory in Gaya Ji</h3>
            <p className="mt-0.5 text-xs text-slate-500">Items visible to tourists visiting Gaya Ji</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { title: "White cotton dhoti & kurta set", cat: "Clothing", rate: "₹120/day", qty: 8, status: "Active" },
            { title: "Travel backpack · 40L", cat: "Backpacks", rate: "₹60/day", qty: 4, status: "Active" },
          ].map((item) => (
            <div key={item.title} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand">{item.cat}</span>
                <p className="mt-1 font-extrabold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">Rate: <span className="font-bold text-ink">{item.rate}</span> · Quantity: {item.qty} units</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{item.status}</span>
                <button
                  onClick={() => alert("Listing edit dialog will open in Milestone 2.")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Policy Reminder */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-brand" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand">Handover & Return Evidence</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              When handing over commodities to a tourist, always record pre-rental condition photos. Upon return, inspect the item thoroughly before closing the rental to protect against unrecorded damages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

