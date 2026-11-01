import { useState } from "react";
import {
  Search, MapPin, Sparkles, ShieldCheck, Star, ArrowRight,
  CheckCircle2, Clock, PackageCheck, Zap, Handshake
} from "lucide-react";

interface HeroProps {
  search: string;
  setSearch: (v: string) => void;
  place: string;
  setPlace: (v: string) => void;
  onExplore: () => void;
  onOpenChat: () => void;
  onOpenRegisterLender: () => void;
}

export function Hero({
  search,
  setSearch,
  place,
  setPlace,
  onExplore,
  onOpenChat,
  onOpenRegisterLender,
}: HeroProps) {
  const [activeTab, setActiveTab] = useState<"tourist" | "lender">("tourist");

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-32">
      {/* Background radial gradient glow (Linear/Stripe style) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[640px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-brand-100/30 to-teal-100/30 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-48 -right-20 -z-10 h-[380px] w-[380px] rounded-full bg-teal-100/40 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-20 -z-10 h-[380px] w-[380px] rounded-full bg-brand-100/40 blur-3xl" />

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* Left Column: Headings, Value Proposition, Action Search */}
          <div className="lg:col-span-7">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-teal animate-pulse" />
              <span>India's 1st Hyperlocal Travel Rental Network</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-800">
                P2P
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-4xl font-black tracking-tight text-ink sm:text-6xl sm:leading-[1.08] lg:text-[3.75rem]">
              Travel Light.{" "}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-teal bg-clip-text text-transparent">
                Rent What You Need,
              </span>{" "}
              From Local Families.
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Say goodbye to packing heavy luggage or buying single-use items for sacred journeys and short stays. 
              Borrow verified commodities—clothing, puja kits, utensils, and travel essentials—right at your destination.
            </p>

            {/* Interactive Search Card */}
            <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-card sm:p-4 backdrop-blur-xl transition hover:shadow-card-hover">
              <div className="flex border-b border-slate-100 pb-3 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tourist")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === "tourist"
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  I'm a Renter / Tourist
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("lender")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === "lender"
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  I Want to Lend & Earn
                </button>
              </div>

              {activeTab === "tourist" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onExplore();
                  }}
                  className="space-y-3"
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
                      <Search size={17} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="What do you need? (dhoti, thali...)"
                        className="w-full bg-transparent text-xs font-medium text-ink placeholder:text-slate-400 outline-none"
                      />
                    </label>

                    <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
                      <MapPin size={17} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="Destination (e.g. Gaya, Bihar)"
                        className="w-full bg-transparent text-xs font-medium text-ink placeholder:text-slate-400 outline-none"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110 hover:shadow-lg"
                    >
                      <Search size={15} />
                      <span>Explore Available Items</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={onOpenChat}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      <Sparkles size={15} className="text-brand-600" />
                      <span>Ask AI Concierge</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-2 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Have spare puja gear, traditional clothes, or household travel kits? Earn guaranteed daily income by renting them to visiting pilgrims and travelers.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenRegisterLender}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-teal-500/25 transition hover:bg-teal-700"
                  >
                    <Handshake size={15} />
                    <span>List Items as a Local Lender</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Small trust indicators */}
            <div className="mt-7 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal" />
                <span>Verified Local Hosts</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-brand-600" />
                <span>Damage & Dispute Shield</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-amber-500" />
                <span>Instant Ghat / Station Handover</span>
              </span>
            </div>
          </div>

          {/* Right Column: Floating Interactive Interface Composition (Linear/Stripe style) */}
          <div className="relative lg:col-span-5">
            {/* Ambient background glow behind cards */}
            <div className="pointer-events-none absolute inset-0 -z-10 scale-95 rounded-4xl bg-gradient-to-tr from-brand-500/15 via-teal/15 to-purple-500/15 blur-2xl" />

            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Featured Card Preview */}
              <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition hover:shadow-card-hover">
                <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85"
                    alt="Traditional dhoti & kurta set"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-md">
                      Pind-daan Essential
                    </span>
                    <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      Ready for Pickup
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 shadow-md backdrop-blur-md">
                    <span className="text-xs font-black text-ink">₹120</span>
                    <span className="text-[10px] font-medium text-slate-500"> / day</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-teal">
                      Clothing · Sanctified
                    </span>
                    <div className="flex items-center gap-1 font-bold text-ink">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                      <span className="text-slate-400 font-normal">(42 rentals)</span>
                    </div>
                  </div>

                  <h3 className="mt-1.5 text-base font-extrabold text-ink">
                    White Cotton Dhoti & Kurta Set
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={13} className="text-slate-400" />
                    <span>Vishnupad Main Gate · Gaya</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 text-xs">
                        SF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">Sharma Family</p>
                        <p className="text-[10px] text-slate-400">Superhost · 5 min away</p>
                      </div>
                    </div>

                    <button
                      onClick={onExplore}
                      className="rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Element 1: Top-Right Lender Earning Pill */}
              <div className="absolute -top-6 -right-4 sm:-right-8 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md animate-float">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lender Payout
                    </span>
                    <p className="text-xs font-black text-ink">₹1,840 Settled</p>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Instant UPI Transfer
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2: Bottom-Left AI Suggestion Pill */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      AI Concierge
                    </span>
                    <p className="text-xs font-bold text-ink">
                      "Found 4 Puja Kits near Deoghat"
                    </p>
                    <p className="text-[10px] text-brand-600 font-semibold">
                      Under ₹100/day · Ready now
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Element 3: Verified Badge Tag */}
              <div className="absolute top-1/2 -right-5 hidden sm:flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/95 px-3 py-1.5 shadow-md backdrop-blur-md animate-float-slow">
                <ShieldCheck size={14} className="text-teal-600" />
                <span className="text-[11px] font-black text-teal-800">
                  Govt ID Verified
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

