import {
  Check, X, ShieldCheck, HeartHandshake, Sparkles, TrendingUp,
  Percent, Clock, Scale
} from "lucide-react";

export function Benefits() {
  const touristBenefits = [
    { text: "Save up to 80% compared to buying items at destination bazaars", highlight: true },
    { text: "Zero luggage surcharge on airlines and comfortable train transit", highlight: false },
    { text: "Sanitized and checked condition guaranteed before release", highlight: true },
    { text: "Convenient public handover at train stations or temple gates", highlight: false },
    { text: "AI assistant instantly matches items to ritual needs", highlight: false },
  ];

  const traditionalPains = [
    "Overpaying for low-quality disposable items in tourist-trap shops",
    "Hauling 15+ kg of heavy pots and traditional clothes on trains",
    "Discarding purchased goods in hotel dustbins when departing",
    "Uncertainty about local availability during peak festival crowds",
    "No buyer protection or dispute resolution if items are defective",
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">THE LOCALCONNECT ADVANTAGE</span>
          <h2 className="section-title mt-2">
            Why Renting Beats Buying Every Single Time
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            Compare the outdated way of purchasing single-use travel items with our modern, peer-to-peer sharing network.
          </p>
        </div>

        {/* Side by side comparison table / cards */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          
          {/* Card 1: Traditional Way (Pain) */}
          <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-red-100 pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100 text-red-600">
                <X size={20} />
              </span>
              <div>
                <h3 className="text-lg font-black text-red-950">Traditional Buying & Hauling</h3>
                <p className="text-xs text-red-700/80">Expensive, wasteful & stressful travel</p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {traditionalPains.map((pain, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-100 text-red-500">
                    <X size={10} />
                  </span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: LocalConnect Way (Gain) */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/60 via-white to-teal-50/50 p-8 shadow-card">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-brand-600 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Recommended
            </div>

            <div className="flex items-center gap-3 border-b border-slate-200/80 pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
                <Sparkles size={20} />
              </span>
              <div>
                <h3 className="text-lg font-black text-ink">With LocalConnect</h3>
                <p className="text-xs text-brand-700 font-semibold">Lightweight, sustainable & effortless</p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {touristBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-ink">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={11} className="stroke-[3]" />
                  </span>
                  <span className={b.highlight ? "font-bold text-ink" : "text-slate-600"}>
                    {b.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Value metrics strip */}
        <div className="mt-12 rounded-3xl border border-slate-200/80 bg-slate-900 p-8 text-white shadow-xl">
          <div className="grid gap-6 sm:grid-cols-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="pt-4 sm:pt-0">
              <p className="text-3xl font-black text-white sm:text-4xl">₹1,400+</p>
              <p className="mt-1 text-xs text-slate-400 font-semibold">Average tourist savings per journey</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="text-3xl font-black text-teal sm:text-4xl">12 kg</p>
              <p className="mt-1 text-xs text-slate-400 font-semibold">Average luggage weight spared per traveler</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="text-3xl font-black text-amber-400 sm:text-4xl">100%</p>
              <p className="mt-1 text-xs text-slate-400 font-semibold">Verified safe public rendezvous points</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

