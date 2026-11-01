import {
  Compass, Flower2, Backpack, Users, ArrowRight, CheckCircle2
} from "lucide-react";

export function UseCases() {
  const useCases = [
    {
      category: "Sacred Pilgrimages",
      title: "Pind-daan, Shradh & Temple Darshans",
      desc: "Pilgrims often need consecrated pure cotton dhotis, brass thalis, and ritual vessels that they won't use again once home.",
      icon: Flower2,
      tag: "High Demand",
      items: ["White Cotton Dhotis", "Brass Puja Kits", "Kusha Mats", "Aarti Bells"],
      color: "from-amber-500/10 to-orange-500/10 border-amber-200/60",
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      category: "Dharamshala Stays",
      title: "Family Cooking & Self-Catering",
      desc: "Families staying in rest houses or guest accommodations who want hygienic home-cooked meals without hauling bulky utensils across states.",
      icon: Users,
      tag: "Family Favorite",
      items: ["Stainless Steel Sets", "Tea Kettles", "Pressure Cookers", "Serving Bowls"],
      color: "from-teal-500/10 to-emerald-500/10 border-teal-200/60",
      iconColor: "text-teal-600 bg-teal-50",
    },
    {
      category: "Backpacker Expeditions",
      title: "Weekend Treks & Station Transit",
      desc: "Solo explorers needing a high-capacity 40L rucksack or rainwear for a 2-day heritage excursion without buying expensive new gear.",
      icon: Backpack,
      tag: "Cost Saver",
      items: ["40L-60L Rucksacks", "Trekking Poles", "Weatherproof Bags", "Headlamps"],
      color: "from-blue-500/10 to-indigo-500/10 border-blue-200/60",
      iconColor: "text-brand-600 bg-brand-50",
    },
    {
      category: "Cultural Immersion",
      title: "Regional Ceremonies & Festivals",
      desc: "Visiting travelers participating in local festivities who need authentic local attire or ceremonial props for a memorable respectful experience.",
      icon: Compass,
      tag: "Cultural Fit",
      items: ["Traditional Sarees", "Kurta Sets", "Ceremonial Shawls", "Footwear"],
      color: "from-purple-500/10 to-pink-500/10 border-purple-200/60",
      iconColor: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/50 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">TAILORED FOR REAL TRAVELERS</span>
          <h2 className="section-title mt-2">
            Perfect For Every Kind of Journey
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            From spiritual rituals to spontaneous weekend treks, LocalConnect eliminates unnecessary purchases and excess baggage fees.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${uc.iconColor}`}>
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-600">
                      {uc.tag}
                    </span>
                  </div>

                  <span className="mt-5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {uc.category}
                  </span>
                  <h3 className="mt-1 text-base font-black text-ink">
                    {uc.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {uc.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Popular Items
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {uc.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-lg bg-slate-50 border border-slate-200/60 px-2 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

