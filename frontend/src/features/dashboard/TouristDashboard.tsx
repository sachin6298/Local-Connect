import { Package, Clock3, CheckCircle2, Search, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface TouristDashboardProps {
  onSearchCategory: (category: string) => void;
  onOpenChat: () => void;
}

export function TouristDashboard({ onSearchCategory, onOpenChat }: TouristDashboardProps) {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brandDark via-brand to-[#2C8C86] p-8 text-white shadow-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={13} /> Tourist Portal
        </span>
        <h1 className="mt-4 text-3xl font-black">
          Welcome back, {profile?.fullName || "Tourist"}!
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
          Search and rent commodities directly from local families in Gaya Ji. Enjoy transparent rates and supervised rental terms.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onSearchCategory("All items")}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-brand transition hover:bg-blue-50"
          >
            <Search size={15} /> Explore Gaya Rentals
          </button>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
          >
            <Sparkles size={15} /> Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Rentals</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand">
              <Package size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">0</p>
          <p className="mt-1 text-xs text-slate-500">Items currently in your custody</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Requests</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">0</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting local lender decision</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Completed Rentals</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/10 text-teal">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-ink">0</p>
          <p className="mt-1 text-xs text-slate-500">Returned in verified condition</p>
        </div>
      </div>

      {/* Quick Category Pickers for Pilgrimage in Gaya Ji */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-ink">Recommended for Gaya Ji / Pitru Paksha</h3>
        <p className="mt-1 text-xs text-slate-500">Temporary necessities you do not need to buy for a short pilgrimage stay</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "White cotton clothes", cat: "Clothing", loc: "Vishnupad East Gate" },
            { title: "Puja thali & brass lota", cat: "Puja materials", loc: "Deoghat Riverside" },
            { title: "Cooking utensil set", cat: "Utensils", loc: "Mangla Gauri Road" },
            { title: "Travel backpack 40L", cat: "Backpacks", loc: "Gaya Junction Area" },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => onSearchCategory(item.cat)}
              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left transition hover:border-brand/40 hover:bg-blue-50/40"
            >
              <span className="text-xs font-extrabold uppercase tracking-wide text-teal">{item.cat}</span>
              <p className="mt-1 font-bold text-ink">{item.title}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={12} /> {item.loc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

