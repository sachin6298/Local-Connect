import {
  Search, MapPin, Star, Shirt, Backpack, CookingPot,
  Flower2, House, Package, ArrowRight, Sparkles, Edit2
} from "lucide-react";

export type Item = {
  id: string;
  title: string;
  category: string;
  locality: string;
  rate: string;
  unit: string;
  rating: string;
  condition: string;
  lender: string;
  image: string;
  tag: string;
};

interface ProductShowcaseProps {
  items: Item[];
  category: string;
  setCategory: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  onRequestRental: (item: Item) => void;
  onOpenChat: () => void;
  onEditPrice: (item: Item) => void;
}

export const CATEGORIES_LIST = [
  { name: "All items", icon: Sparkles },
  { name: "Clothing", icon: Shirt },
  { name: "Puja materials", icon: Flower2 },
  { name: "Backpacks", icon: Backpack },
  { name: "Utensils", icon: CookingPot },
  { name: "Household", icon: House },
  { name: "Daily-use", icon: Package },
];

export function ProductShowcase({
  items,
  category,
  setCategory,
  search,
  setSearch,
  onRequestRental,
  onOpenChat,
  onEditPrice,
}: ProductShowcaseProps) {
  return (
    <section id="explore-items" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">LIVE VERIFIED INVENTORY</span>
            <h2 className="section-title mt-2">
              Browse Available Rentals Near You
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl">
              Clean, sanctified, and inspected commodities provided by verified neighborhood hosts. No hidden charges.
            </p>
          </div>

          {/* Quick Clear / Reset */}
          {(category !== "All items" || search) && (
            <button
              onClick={() => {
                setCategory("All items");
                setSearch("");
              }}
              className="self-start rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 md:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-6">
          {/* Category Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_LIST.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Filter */}
          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by keyword or locality..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-ink placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-200 text-slate-500">
              <Search size={22} />
            </span>
            <h3 className="mt-4 text-base font-black text-ink">No items match your search</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your category or search terms, or ask our AI assistant to find alternatives.
            </p>
            <button
              onClick={onOpenChat}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              <Sparkles size={14} /> Ask AI Assistant
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-700 shadow-sm backdrop-blur-md">
                      {item.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {item.condition}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold uppercase tracking-wider text-teal">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-ink">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {item.rating}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-black text-ink line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{item.locality}</span>
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Listed by <span className="font-medium text-slate-600">{item.lender}</span>
                    </p>
                  </div>
                </div>

                {/* Card Footer with Price, Edit Price Button & Rent Action */}
                <div className="border-t border-slate-100 p-5 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    {/* Price section with Edit Button */}
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-lg font-black text-ink">{item.rate}</span>
                        <span className="ml-0.5 text-[10px] text-slate-400 font-medium">/{item.unit}</span>
                      </div>
                      
                      {/* Fully functional Edit button beside price information */}
                      <button
                        type="button"
                        onClick={() => onEditPrice(item)}
                        aria-label={`Edit price for ${item.title}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2 py-1 text-[10px] font-bold text-slate-600 shadow-2xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition"
                        title="Edit rental rate"
                      >
                        <Edit2 size={11} className="text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onRequestRental(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 group-hover:shadow-brand-500/25 group-hover:shadow-md"
                    >
                      <span>Rent Item</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
