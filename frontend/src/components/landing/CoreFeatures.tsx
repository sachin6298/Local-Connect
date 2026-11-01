import {
  ShieldCheck, MapPin, Sparkles, Scale, RefreshCw, Lock,
  CheckCircle, ArrowUpRight, Zap, Users
} from "lucide-react";

export function CoreFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-slate-50/70 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="eyebrow">BUILT FOR TRUST & CONVENIENCE</span>
          <h2 className="section-title mt-2">
            Engineered for Stress-Free Travel & Fair Local Earnings
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Every feature is designed to protect both the pilgrim traveler and the local host family, keeping transactions safe, verified, and transparent.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-5 md:grid-cols-12">
          
          {/* Card 1: Large Feature - PostGIS Proximity Search (7 cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-card-hover md:col-span-7">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <MapPin size={22} />
              </span>
              <span className="rounded-full bg-brand-100/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-700">
                PostGIS Powered
              </span>
            </div>

            <h3 className="mt-5 text-xl font-black text-ink">
              Hyperlocal Proximity Matching
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 max-w-md">
              Find items located within a 5-minute walk of your temple gate, railway station, or Dharamshala. No travelling across town to fetch rental items.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-ink">Vishnupad Main Gate</span>
                </div>
                <span className="font-semibold text-slate-500">Radius: 800m</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm text-xs">
                <span className="font-medium text-slate-700">6 available clothing sets & puja kits nearby</span>
                <span className="font-bold text-brand-600 text-[11px]">Instant View</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Concierge (5 cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-brand-600 via-indigo-600 to-brand-800 p-7 text-white shadow-sm transition-all duration-300 hover:shadow-card-hover md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Sparkles size={22} />
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-md">
                Gemini AI
              </span>
            </div>

            <h3 className="mt-5 text-xl font-black text-white">
              AI Travel & Ritual Concierge
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              Not sure what utensils or clothing are required for rituals? Just explain your trip purpose, and our AI recommends the exact item bundle.
            </p>

            <div className="mt-6 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
              <p className="text-[11px] text-white/70 italic">"Coming with family for 2 days. What ritual utensils do we need?"</p>
              <div className="mt-2 rounded-xl bg-white/20 p-2 font-semibold text-[11px] text-white">
                ✨ Suggested: 1 Brass Thali Kit + 2 Pure Cotton Dhoti Sets
              </div>
            </div>
          </div>

          {/* Card 3: Escrow & Dispute Shield (4 cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-card-hover md:col-span-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-600">
              <ShieldCheck size={20} />
            </span>
            <h3 className="mt-4 text-base font-black text-ink">
              Escrow & Damage Shield
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Handover and return inspection photos are timestamped on-chain in our database. Neither party can claim false damages.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-teal-700">
              <CheckCircle size={13} /> Protected by Razorpay Escrow
            </div>
          </div>

          {/* Card 4: Verified Local Lenders (4 cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-card-hover md:col-span-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600">
              <Users size={20} />
            </span>
            <h3 className="mt-4 text-base font-black text-ink">
              100% ID Verified Hosts
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Every local lender must pass government ID and address verification by platform administrators before their listings appear.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-purple-700">
              <CheckCircle size={13} /> Strict Admin Moderation
            </div>
          </div>

          {/* Card 5: Circular Economy & Zero Waste (4 cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-card-hover md:col-span-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <RefreshCw size={20} />
            </span>
            <h3 className="mt-4 text-base font-black text-ink">
              Sustainable Zero Baggage
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Eliminate the cycle of buying cheap items in temple bazaars only to abandon them in hotel bins. Reuse cleanly and save money.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle size={13} /> 94% Waste Reduction
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

