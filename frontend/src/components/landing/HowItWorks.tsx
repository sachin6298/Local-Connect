import { useState } from "react";
import {
  Search, Handshake, CheckCircle2, ArrowRight, ShieldCheck,
  Camera, Wallet, Sparkles, MapPin, Clock
} from "lucide-react";

export function HowItWorks() {
  const [roleMode, setRoleMode] = useState<"tourist" | "lender">("tourist");

  const touristSteps = [
    {
      step: "01",
      title: "Search What You Need",
      desc: "Search by pilgrimage item, travel gear, or locality. Or tell our AI assistant your travel itinerary and dates for tailored suggestions.",
      icon: Search,
      badge: "Fast & Smart",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-500 shadow-sm">
            <Search size={14} className="text-brand-500" />
            <span>Puja thali & dhoti in Gaya...</span>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-600">
              Clothing
            </span>
            <span className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">
              Puja Materials
            </span>
            <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              Utensils
            </span>
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Public Handover & Photo Inspection",
      desc: "Meet the verified local family at an agreed public rendezvous like Gaya Junction or Vishnupad Ghat. Confirm condition with quick photo log.",
      icon: Handshake,
      badge: "100% Safe",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-teal" />
              <span className="font-bold text-ink">Vishnupad North Gate</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              Verified Spot
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white p-2 text-[11px] text-slate-500 shadow-sm">
            <Camera size={13} className="text-slate-400" />
            <span>Inspection photo captured & timestamped</span>
          </div>
        </div>
      ),
    },
    {
      step: "03",
      title: "Return & Hassle-Free Settlement",
      desc: "Drop the item off at the end of your stay. Security deposit is released instantly to your bank account with zero hidden fees.",
      icon: CheckCircle2,
      badge: "Instant Release",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Rental Completed</span>
            </div>
            <span className="font-black text-emerald-900">₹0 Fee Penalty</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Security hold cleared via Razorpay · Receipt emailed
          </p>
        </div>
      ),
    },
  ];

  const lenderSteps = [
    {
      step: "01",
      title: "List Your Belongings in 2 Minutes",
      desc: "Snap a few photos of your traditional clothing, brass utensils, backpacks, or ritual items. Set your daily price and available dates.",
      icon: Camera,
      badge: "Zero Cost",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs shadow-sm">
            <span className="font-bold text-ink">40L Trekking Backpack</span>
            <span className="font-black text-brand-600">₹60 / day</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Clock size={12} className="text-slate-400" />
            <span>Available all week</span>
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Receive Verified Requests",
      desc: "Get instant alerts when visiting pilgrims and travelers request your item. Review their profile and accept with one click.",
      icon: ShieldCheck,
      badge: "You Are In Control",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="rounded-xl bg-white p-2.5 shadow-sm text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>Ramesh Kumar</span>
              <span className="text-emerald-600">ID Verified</span>
            </div>
            <p className="text-[11px] text-slate-500">Dates: Oct 12 - Oct 15 (3 days)</p>
          </div>
        </div>
      ),
    },
    {
      step: "03",
      title: "Direct UPI Earning Settlement",
      desc: "Earn regular secondary household income from items sitting in your cupboards. Get paid directly to your bank account with complete platform protection.",
      icon: Wallet,
      badge: "Guaranteed Payout",
      illustration: (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="rounded-xl bg-teal-50 p-2.5 text-xs text-teal-900 font-bold flex justify-between items-center">
            <span>Direct Bank Transfer</span>
            <span className="font-black">₹1,840.00</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Settled after successful item return inspection
          </p>
        </div>
      ),
    },
  ];

  const currentSteps = roleMode === "tourist" ? touristSteps : lenderSteps;

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="eyebrow">SIMPLE 3-STEP PROCESS</span>
          <h2 className="section-title mt-2">
            How LocalConnect Works For You
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            Whether you are a traveler looking to save luggage or a local family with useful items to share, the process is fast, safe, and transparent.
          </p>

          {/* Toggle pill */}
          <div className="mt-7 inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-inner">
            <button
              onClick={() => setRoleMode("tourist")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                roleMode === "tourist"
                  ? "bg-white text-ink shadow-sm"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              For Travelers & Tourists
            </button>
            <button
              onClick={() => setRoleMode("lender")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                roleMode === "lender"
                  ? "bg-white text-ink shadow-sm"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              For Local Families & Lenders
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {currentSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:bg-white hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-300 group-hover:text-brand-500 transition-colors">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-slate-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div className="mt-5 mb-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-110">
                      <Icon size={22} />
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-ink">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  {item.illustration}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

