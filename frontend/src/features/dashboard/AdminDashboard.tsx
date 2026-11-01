import { ShieldAlert, Users, Percent, FileText, Check, X, ShieldCheck } from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
          <ShieldAlert size={13} /> Platform Operator Console
        </span>
        <h1 className="mt-3 text-3xl font-black">Marketplace Governance & Moderation</h1>
        <p className="mt-1 text-sm text-slate-400">
          Supervise lender onboarding, listing approvals, locality fee policies, and damage claims.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Lenders</span>
          <p className="mt-3 text-3xl font-black text-amber-600">0</p>
          <p className="mt-1 text-xs text-slate-500">Requires verification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Active Items</span>
          <p className="mt-3 text-3xl font-black text-ink">4</p>
          <p className="mt-1 text-xs text-slate-500">Gaya Ji catalogue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Disputes</span>
          <p className="mt-3 text-3xl font-black text-red-600">0</p>
          <p className="mt-1 text-xs text-slate-500">Damage claims to adjudicate</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Fee Policies Active</span>
          <p className="mt-3 text-3xl font-black text-teal">1</p>
          <p className="mt-1 text-xs text-slate-500">Gaya Ji: 10% platform fee</p>
        </div>
      </div>

      {/* Locality Fee Policy Configuration */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-ink">Configured Locality Fee Policies</h3>
            <p className="mt-0.5 text-xs text-slate-500">Revenue configuration per destination as outlined in PRD</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3.5">Locality</th>
                <th className="p-3.5">Platform Fee</th>
                <th className="p-3.5">Delivery Charge</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3.5 font-bold text-ink">Gaya Ji (Bihar)</td>
                <td className="p-3.5 text-slate-600">10.00% (Percentage)</td>
                <td className="p-3.5 text-slate-600">₹50.00 (Fixed Standard)</td>
                <td className="p-3.5"><span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">Active</span></td>
                <td className="p-3.5 text-right">
                  <button className="font-bold text-brand hover:underline" onClick={() => alert("Fee policy editor will open in Milestone 8.")}>
                    Edit Policy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

