import { useCountUp } from "../../hooks/useScrollAnimation";
import { Package, Users, Leaf, IndianRupee } from "lucide-react";

export function ImpactStats() {
  const stat1 = useCountUp(4850, 1800);
  const stat2 = useCountUp(320, 1600);
  const stat3 = useCountUp(1840, 1900);
  const stat4 = useCountUp(68, 1500);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-paper to-slate-50 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">MEASURABLE IMPACT</span>
          <h2 className="section-title mt-2">
            Empowering Travelers & Neighborhood Economies
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            Real impact measured across pilgrimages, heritage circuits, and community rental handovers.
          </p>
        </div>

        {/* Counter cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Stat 1 */}
          <div
            ref={stat1.ref as any}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition hover:shadow-card-hover hover:-translate-y-1"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
              <Package size={22} />
            </span>
            <p className="text-4xl font-black text-ink tracking-tight">
              {stat1.count.toLocaleString()}+
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Items Rented
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clean clothing, utensils, and gear supplied locally
            </p>
          </div>

          {/* Stat 2 */}
          <div
            ref={stat2.ref as any}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition hover:shadow-card-hover hover:-translate-y-1"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600 mb-4">
              <Users size={22} />
            </span>
            <p className="text-4xl font-black text-ink tracking-tight">
              {stat2.count.toLocaleString()}+
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Lenders
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Local families earning regular extra income
            </p>
          </div>

          {/* Stat 3 */}
          <div
            ref={stat3.ref as any}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition hover:shadow-card-hover hover:-translate-y-1"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <Leaf size={22} />
            </span>
            <p className="text-4xl font-black text-ink tracking-tight">
              {stat3.count.toLocaleString()} kg
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Waste Diverted
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Single-use cloth, plastics, and discarded bazaar items
            </p>
          </div>

          {/* Stat 4 */}
          <div
            ref={stat4.ref as any}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition hover:shadow-card-hover hover:-translate-y-1"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
              <IndianRupee size={22} />
            </span>
            <p className="text-4xl font-black text-ink tracking-tight">
              ₹{stat4.count.toLocaleString()} Lakhs+
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Tourist Savings
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Saved compared to tourist-markup retail prices
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

